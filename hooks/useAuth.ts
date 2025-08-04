import { useState, useEffect } from 'react';
import { User } from '../lib/types';
import { apiClient } from '../lib/api';

// Global auth state management using singleton pattern
class AuthState {
  private static instance: AuthState;
  private user: User | null = null;
  private isInitialized = false;
  private listeners: Array<() => void> = [];

  static getInstance(): AuthState {
    if (!AuthState.instance) {
      AuthState.instance = new AuthState();
    }
    return AuthState.instance;
  }

  getUser(): User | null {
    return this.user;
  }

  setUser(user: User | null): void {
    this.user = user;
    this.notifyListeners();
    
    // Update localStorage only on client side
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('currentUser');
      }
    }
  }

  isUserInitialized(): boolean {
    return this.isInitialized;
  }

  setInitialized(value: boolean): void {
    this.isInitialized = value;
    this.notifyListeners();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  // Initialize from localStorage
  initialize(): void {
    if (this.isInitialized) return;
    
    try {
      // Only access localStorage on client side
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          this.user = JSON.parse(storedUser);
        }
      }
    } catch {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('currentUser');
      }
    }
    
    this.isInitialized = true;
    this.notifyListeners();
  }

  clear(): void {
    this.user = null;
    this.isInitialized = false;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
    }
    this.notifyListeners();
  }
}

// Main auth hook
export const useAuth = () => {
  const authState = AuthState.getInstance();
  const [, forceUpdate] = useState({});

  // Force re-render when auth state changes
  const rerender = () => forceUpdate({});

  useEffect(() => {
    const unsubscribe = authState.subscribe(rerender);
    
    // Initialize auth state on first mount
    if (typeof window !== 'undefined') {
      authState.initialize();
    }
    
    return unsubscribe;
  }, [authState]);

  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    region: string;
  }) => {
    try {
      // Convert firstName + lastName to name for API
      const registerData = {
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        password: userData.password,
        region: userData.region
      };
      
      const response = await apiClient.register(registerData);
      if (response.success && response.data?.user) {
        authState.setUser(response.data.user);
        return { success: true };
      }
      return { success: false, error: response.message || 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await apiClient.login(credentials);
      if (response.success && response.data?.user) {
        authState.setUser(response.data.user);
        return { success: true };
      }
      return { success: false, error: response.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please check your credentials.' };
    }
  };

  const logout = async () => {
    // Just clear the local auth state - no API call needed
    authState.clear();
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const response = await apiClient.updateProfile(updates);
      if (response.success && response.data) {
        authState.setUser(response.data);
        return { success: true };
      }
      return { success: false, error: response.message || 'Profile update failed' };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Profile update failed. Please try again.' };
    }
  };

  return {
    user: authState.getUser(),
    isAuthenticated: !!authState.getUser(),
    isInitialized: authState.isUserInitialized(),
    register,
    login,
    logout,
    updateProfile
  };
};

// Lightweight hook for just checking auth status
export const useAuthStatus = () => {
  const authState = AuthState.getInstance();
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = authState.subscribe(() => forceUpdate({}));
    
    if (typeof window !== 'undefined') {
      authState.initialize();
    }
    
    return unsubscribe;
  }, [authState]);

  return {
    isAuthenticated: !!authState.getUser(),
    isInitialized: authState.isUserInitialized(),
    user: authState.getUser()
  };
};
import { useState, useEffect, useCallback } from 'react';
import type { User } from '../lib/types';
import { apiClient } from '../lib/api';
import { queryClient } from '../lib/queryClient';

// Global state management using a simple singleton pattern
class AuthState {
  private static instance: AuthState;
  private user: User | null = null;
  private isLoading: boolean = true;
  private listeners: Set<() => void> = new Set();

  static getInstance() {
    if (!AuthState.instance) {
      AuthState.instance = new AuthState();
    }
    return AuthState.instance;
  }

  // Initialize authentication state
  async initialize() {
    this.isLoading = true;
    this.notifyListeners();

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          // Set token first so API calls can be made
          apiClient.setToken(token);
          
          // Verify token with server by trying to get current user profile
          const response = await apiClient.getProfile();
          
          if (response.success && response.data) {
            // Token is valid, use server data as source of truth
            this.user = response.data;
            // Update localStorage with fresh user data
            localStorage.setItem('user', JSON.stringify(response.data));
          } else {
            throw new Error('Invalid token response');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          // Clear invalid token and user data
          this.user = null;
          apiClient.clearToken();
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Clear any cached data from previous invalid session
          queryClient.clear();
        }
      } else {
        // No token or user data, user is not authenticated
        this.user = null;
        apiClient.clearToken();
      }
    }

    this.isLoading = false;
    this.notifyListeners();
  }

  // Get current state
  getState() {
    return {
      user: this.user,
      isAuthenticated: !!this.user && !this.isLoading,
      isLoading: this.isLoading,
    };
  }

  // Set user and notify listeners
  setUser(user: User | null) {
    this.user = user;
    this.isLoading = false; // Ensure loading is stopped when user is set
    
    // Update localStorage
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    
    this.notifyListeners();
  }

  // Subscribe to state changes
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Notify all listeners
  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

// Initialize singleton
const authState = AuthState.getInstance();

// Main authentication hook
export const useAuthentication = () => {
  const [state, setState] = useState(authState.getState());

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authState.subscribe(() => {
      setState(authState.getState());
    });

    // Initialize on first mount if still loading
    const currentState = authState.getState();
    if (currentState.isLoading) {
      authState.initialize().catch((error) => {
        console.error('Authentication initialization failed:', error);
        // Ensure we stop loading even if initialization fails
        authState.setUser(null);
      });
    }

    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await apiClient.login({ email, password });
      if (response.success && response.data) {
        // Clear all cached data from previous user
        await queryClient.clear();
        
        authState.setUser(response.data.user);
        // Token is already stored by apiClient.login
        
        // Immediately refetch user-specific data for the new user
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['teams', 'my'] });
          queryClient.invalidateQueries({ queryKey: ['challenges'] });
          queryClient.invalidateQueries({ queryKey: ['matches'] });
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }, 100);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  }, []);

  const register = useCallback(async (userData: {
    email: string;
    password: string;
    name: string;
    region: string;
    phone?: string;
  }) => {
    try {
      const response = await apiClient.register(userData);
      if (response.success && response.data) {
        // Clear all cached data from previous user
        await queryClient.clear();
        
        authState.setUser(response.data.user);
        // Token is already stored by apiClient.register
        
        // Immediately refetch user-specific data for the new user
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['teams', 'my'] });
          queryClient.invalidateQueries({ queryKey: ['challenges'] });
          queryClient.invalidateQueries({ queryKey: ['matches'] });
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }, 100);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    // Clear all cached data when logging out
    queryClient.clear();
    
    apiClient.clearToken();
    authState.setUser(null);
  }, []);

  const updateProfile = useCallback(async (userData: Partial<User>) => {
    try {
      const response = await apiClient.updateProfile(userData);
      if (response.success && response.data) {
        authState.setUser(response.data);
      }
      return response;
    } catch (error) {
      throw error;
    }
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    updateProfile,
  };
};

// Optional: Hook for just checking authentication status
export const useAuthStatus = () => {
  const [state, setState] = useState(authState.getState());

  useEffect(() => {
    const unsubscribe = authState.subscribe(() => {
      setState(authState.getState());
    });

    // Initialize on first mount if still loading
    const currentState = authState.getState();
    if (currentState.isLoading) {
      authState.initialize().catch((error) => {
        console.error('Authentication initialization failed:', error);
        authState.setUser(null);
      });
    }

    return unsubscribe;
  }, []);

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
  };
};














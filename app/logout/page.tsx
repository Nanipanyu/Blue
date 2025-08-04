'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthentication } from '../../hooks/useauthentication';
import { apiClient } from '../../lib/api';

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuthentication();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Call the logout function from authentication hook
        await logout();
        
        // Clear token from API client
        apiClient.clearToken();
        
        // Clear any additional data from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Small delay to ensure cleanup is complete
        setTimeout(() => {
          router.push('/login');
        }, 500);
        
      } catch (error) {
        console.error('Logout error:', error);
        // Even if logout fails, clear local data and redirect
        apiClient.clearToken();
        localStorage.clear();
        router.push('/login');
      }
    };

    performLogout();
  }, [logout, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Logging you out...</p>
        <p className="mt-2 text-sm text-gray-500">Please wait while we securely log you out</p>
      </div>
    </div>
  );
}

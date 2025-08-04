'use client';

import Link from 'next/link';
import { useAuthentication } from '../hooks/useauthentication';

interface LogoutButtonProps {
  className?: string;
}

export default function LogoutButton({ className = "" }: LogoutButtonProps) {
  const { user } = useAuthentication();

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {user && (
        <span className="text-sm text-gray-600 hidden sm:block">
          Welcome, {user.name}!
        </span>
      )}
      <Link 
        href="/logout" 
        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Logout
      </Link>
    </div>
  );
}

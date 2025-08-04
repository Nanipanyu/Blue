'use client';

import { useState } from 'react';
import { ProfileData } from '../hooks/useProfile';

interface EditPrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: ProfileData;
  onSave: (data: {
    profileVisibility?: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY';
    emailVisibility?: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY';
    emailNotifications?: boolean;
    pushNotifications?: boolean;
  }) => void;
  isLoading?: boolean;
}

export default function EditPrivacySettingsModal({
  isOpen,
  onClose,
  user,
  onSave,
  isLoading = false
}: EditPrivacySettingsModalProps) {
  const [formData, setFormData] = useState<{
    profileVisibility: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY';
    emailVisibility: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY';
    emailNotifications: boolean;
    pushNotifications: boolean;
  }>({
    profileVisibility: (user.profileVisibility as 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY') || 'PUBLIC',
    emailVisibility: (user.emailVisibility as 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY') || 'PRIVATE',
    emailNotifications: user.emailNotifications ?? true,
    pushNotifications: user.pushNotifications ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Privacy Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Visibility
            </label>
            <select
              name="profileVisibility"
              value={formData.profileVisibility}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PUBLIC">Public - Anyone can see your profile</option>
              <option value="FRIENDS_ONLY">Friends Only - Only your connections can see</option>
              <option value="PRIVATE">Private - Only you can see your profile</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Controls who can view your full profile information
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Visibility
            </label>
            <select
              name="emailVisibility"
              value={formData.emailVisibility}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PRIVATE">Private - Hidden from others</option>
              <option value="FRIENDS_ONLY">Friends Only - Visible to connections</option>
              <option value="PUBLIC">Public - Visible to everyone</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Controls who can see your email address on your profile
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Notification Preferences</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm text-gray-900">Email Notifications</label>
                <p className="text-xs text-gray-500">Receive updates via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={formData.emailNotifications}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm text-gray-900">Push Notifications</label>
                <p className="text-xs text-gray-500">Receive push notifications in the app</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="pushNotifications"
                  checked={formData.pushNotifications}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-amber-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-amber-700">
                <p className="font-medium">Privacy Notice</p>
                <p>These settings control your privacy across the platform. Making your profile private will hide it from team searches and public directories.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

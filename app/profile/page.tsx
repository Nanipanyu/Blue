'use client';

import { useState } from 'react';
import { useProfile, ProfileData, useUpdateBasicInfo, useUpdateSocialLinks, useUpdatePrivacySettings, useUpdateSportsPreferences } from '../../hooks/useProfile';
import ProtectedRoute from '../../components/ProtectedRoute';
import EditBasicInfoModal from '../../components/EditBasicInfoModal';
import EditSocialLinksModal from '../../components/EditSocialLinksModal';
import EditPrivacySettingsModal from '../../components/EditPrivacySettingsModal';
import EditSportsPreferencesModal from '../../components/EditSportsPreferencesModal';

// Basic info section component
const BasicInfoSection = ({ user, onEdit }: { user: ProfileData; onEdit: () => void }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold">Basic Information</h2>
      <button 
        onClick={onEdit}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        Edit
      </button>
    </div>
    <div className="space-y-3">
      <div>
        <label className="text-sm text-gray-600">Name</label>
        <p className="text-gray-900">{user.name}</p>
      </div>
      <div>
        <label className="text-sm text-gray-600">Email</label>
        <p className="text-gray-900">{user.email}</p>
      </div>
      <div>
        <label className="text-sm text-gray-600">Phone</label>
        <p className="text-gray-900">{user.phone || 'Not provided'}</p>
      </div>
      <div>
        <label className="text-sm text-gray-600">Region</label>
        <p className="text-gray-900">{user.region}</p>
      </div>
      {user.bio && (
        <div>
          <label className="text-sm text-gray-600">Bio</label>
          <p className="text-gray-900">{user.bio}</p>
        </div>
      )}
    </div>
  </div>
);

// Placeholder section component
const PlaceholderSection = ({ title, description }: { title: string; description: string }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    <div className="text-center py-8">
      <div className="text-gray-400 mb-4">
        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <p className="text-gray-600 text-sm">{description}</p>
      <p className="text-xs text-gray-500 mt-2">Available after database migration</p>
    </div>
  </div>
);

// Stats section component
const StatsSection = ({ user }: { user: ProfileData }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <h2 className="text-xl font-semibold mb-4">Statistics</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">{user.totalMatches || 0}</div>
        <div className="text-sm text-gray-600">Matches</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{user.totalWins || 0}</div>
        <div className="text-sm text-gray-600">Wins</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-orange-600">{user.totalGoals || 0}</div>
        <div className="text-sm text-gray-600">Goals</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600">{user.totalAssists || 0}</div>
        <div className="text-sm text-gray-600">Assists</div>
      </div>
    </div>
  </div>
);

export default function ProfilePage() {
  const { data: user, isLoading, error } = useProfile();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Debug logging
  console.log('Profile Debug:', { user, isLoading, error });
  
  // Modal states
  const [showBasicInfoModal, setShowBasicInfoModal] = useState(false);
  const [showSocialLinksModal, setShowSocialLinksModal] = useState(false);
  const [showPrivacySettingsModal, setShowPrivacySettingsModal] = useState(false);
  const [showSportsPreferencesModal, setShowSportsPreferencesModal] = useState(false);
  
  // Mutations
  const updateBasicInfoMutation = useUpdateBasicInfo();
  const updateSocialLinksMutation = useUpdateSocialLinks();
  const updatePrivacySettingsMutation = useUpdatePrivacySettings();
  const updateSportsPreferencesMutation = useUpdateSportsPreferences();

  // Modal handlers
  const handleEditBasicInfo = () => setShowBasicInfoModal(true);
  const handleEditSocialLinks = () => setShowSocialLinksModal(true);
  const handleEditPrivacySettings = () => setShowPrivacySettingsModal(true);
  const handleEditSportsPreferences = () => setShowSportsPreferencesModal(true);
  
  const handleSaveBasicInfo = async (data: Partial<ProfileData>) => {
    try {
      await updateBasicInfoMutation.mutateAsync(data);
      setShowBasicInfoModal(false);
    } catch (error) {
      console.error('Failed to update basic info:', error);
    }
  };
  
  const handleSaveSocialLinks = async (data: {
    instagramUrl?: string;
    twitterUrl?: string;
    facebookUrl?: string;
    linkedinUrl?: string;
  }) => {
    try {
      await updateSocialLinksMutation.mutateAsync(data);
      setShowSocialLinksModal(false);
    } catch (error) {
      console.error('Failed to update social links:', error);
    }
  };
  
  const handleSavePrivacySettings = async (data: {
    profileVisibility?: "PUBLIC" | "PRIVATE" | "FRIENDS_ONLY";
    emailVisibility?: "PUBLIC" | "PRIVATE" | "FRIENDS_ONLY";
    emailNotifications?: boolean;
    pushNotifications?: boolean;
  }) => {
    try {
      await updatePrivacySettingsMutation.mutateAsync(data);
      setShowPrivacySettingsModal(false);
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
    }
  };
  
  const handleSaveSportsPreferences = async (data: {
      favoriteSports?: string[];
      skillLevel?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "PROFESSIONAL";
      preferredPositions?: string[];
      playingExperience?: number;
      coachingExperience?: boolean;
      favoriteTeams?: string[];
      favoritePlayers?: string[];
    }) => {
      try {
        await updateSportsPreferencesMutation.mutateAsync(data);
        setShowSportsPreferencesModal(false);
      } catch (error) {
        console.error('Failed to update sports preferences:', error);
      }
    };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    console.error('Profile error:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error loading profile</h2>
          <p className="text-gray-600 mb-4">
            {error.message === 'Unauthorized' || error.message?.includes('401') 
              ? 'Please log in to view your profile.' 
              : 'Please try again later.'}
          </p>
          {(error.message === 'Unauthorized' || error.message?.includes('401')) && (
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile not found</h2>
          <p className="text-gray-600">Unable to load your profile.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'social', name: 'Social Links' },
    { id: 'sports', name: 'Sports Preferences' },
    { id: 'achievements', name: 'Achievements' },
    { id: 'availability', name: 'Availability' },
    { id: 'media', name: 'Media' },
    { id: 'privacy', name: 'Privacy' },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {user.isVerified && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                )}
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Complete Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <BasicInfoSection 
                user={user} 
                onEdit={handleEditBasicInfo} 
              />
              <StatsSection user={user} />
              <PlaceholderSection 
                title="Recent Activity" 
                description="Your recent matches, achievements, and team activities will appear here." 
              />
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Social Links</h2>
                  <button 
                    onClick={handleEditSocialLinks}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-3">
                  {user.instagramUrl && (
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      <a href={user.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Instagram
                      </a>
                    </div>
                  )}
                  {user.twitterUrl && (
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <a href={user.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Twitter
                      </a>
                    </div>
                  )}
                  {user.facebookUrl && (
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <a href={user.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Facebook
                      </a>
                    </div>
                  )}
                  {!user.instagramUrl && !user.twitterUrl && !user.facebookUrl && !user.linkedinUrl && (
                    <p className="text-gray-500 text-center py-8">No social links added yet. Click Edit to add your social media profiles.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sports' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Sports Preferences</h2>
                  <button 
                    onClick={handleEditSportsPreferences}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Favorite Sports</label>
                    <div className="flex flex-wrap gap-2">
                      {user.favoriteSports && user.favoriteSports.length > 0 ? (
                        user.favoriteSports.map((sport, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {sport}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500">No sports selected</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
                    <p className="text-gray-600 capitalize">{user.skillLevel?.toLowerCase() || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Positions</label>
                    <div className="flex flex-wrap gap-2">
                      {user.preferredPositions && user.preferredPositions.length > 0 ? (
                        user.preferredPositions.map((position, index) => (
                          <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            {position}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500">No positions selected</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Playing Experience</label>
                    <p className="text-gray-600">{user.playingExperience || 0} years</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Coaching Experience</label>
                    <p className="text-gray-600">{user.coachingExperience ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Favorite Teams</label>
                    <div className="flex flex-wrap gap-2">
                      {user.favoriteTeams && user.favoriteTeams.length > 0 ? (
                        user.favoriteTeams.map((team, index) => (
                          <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                            {team}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500">No favorite teams selected</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Favorite Players</label>
                    <div className="flex flex-wrap gap-2">
                      {user.favoritePlayers && user.favoritePlayers.length > 0 ? (
                        user.favoritePlayers.map((player, index) => (
                          <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                            {player}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500">No favorite players selected</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <PlaceholderSection 
              title="Achievements & Trophies" 
              description="Showcase your sporting achievements and trophies." 
            />
          )}

          {activeTab === 'availability' && (
            <PlaceholderSection 
              title="Availability" 
              description="Set your weekly availability for matches and training." 
            />
          )}

          {activeTab === 'media' && (
            <PlaceholderSection 
              title="Media Gallery" 
              description="Upload photos and highlight videos from your matches." 
            />
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Privacy Settings</h2>
                  <button 
                    onClick={handleEditPrivacySettings}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Visibility</label>
                    <p className="text-gray-600 capitalize">{user.profileVisibility || 'public'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Visibility</label>
                    <p className="text-gray-600 capitalize">{user.emailVisibility || 'private'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Notifications</label>
                    <p className="text-gray-600">{user.emailNotifications ? 'Enabled' : 'Disabled'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Push Notifications</label>
                    <p className="text-gray-600">{user.pushNotifications ? 'Enabled' : 'Disabled'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Edit Modals */}
      {user && (
        <>
          <EditBasicInfoModal
            isOpen={showBasicInfoModal}
            onClose={() => setShowBasicInfoModal(false)}
            user={user}
            onSave={handleSaveBasicInfo}
            isLoading={updateBasicInfoMutation.isPending}
          />
          
          <EditSocialLinksModal
            isOpen={showSocialLinksModal}
            onClose={() => setShowSocialLinksModal(false)}
            user={user}
            onSave={handleSaveSocialLinks}
            isLoading={updateSocialLinksMutation.isPending}
          />
          
          <EditPrivacySettingsModal
            isOpen={showPrivacySettingsModal}
            onClose={() => setShowPrivacySettingsModal(false)}
            user={user}
            onSave={handleSavePrivacySettings}
            isLoading={updatePrivacySettingsMutation.isPending}
          />
          
          <EditSportsPreferencesModal
            isOpen={showSportsPreferencesModal}
            onClose={() => setShowSportsPreferencesModal(false)}
            user={user}
            onSave={handleSaveSportsPreferences}
            isLoading={updateSportsPreferencesMutation.isPending}
          />
        </>
      )}
    </ProtectedRoute>
  );
}

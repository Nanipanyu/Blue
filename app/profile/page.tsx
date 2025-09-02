'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useProfile, ProfileData, useUpdateBasicInfo, useUpdatePrivacySettings, useUpdateSportsPreferences, useUpdateAvailability } from '../../hooks/useProfile';
import { useUserPosts, useTogglePostLike, useAddPostComment, useCreatePost } from '../../hooks/usePosts';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppNavbar from '../../components/AppNavbar';
import EditBasicInfoModal from '../../components/EditBasicInfoModal';
import EditPrivacySettingsModal from '../../components/EditPrivacySettingsModal';
import EditSportsPreferencesModal from '../../components/EditSportsPreferencesModal';
import { PhotoGallerySection } from '../../components/PhotoGallerySection';
import { VideoGallerySection } from '../../components/VideoGallerySection';

// Basic info section component
const BasicInfoSection = ({ user, onEdit }: { user: ProfileData; onEdit: () => void }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold">About {user.name}</h2>
      <button 
        onClick={onEdit}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        Edit
      </button>
    </div>
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
        </svg>
        <p className="text-gray-900">{user.email}</p>
      </div>
      <div className="flex items-center space-x-3">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-gray-900">{user.region}</p>
      </div>
      <div className="flex items-start space-x-3">
        <svg className="w-5 h-5 text-gray-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <p className="text-gray-900">{user.bio || 'No bio added yet'}</p>
      </div>
      
      {/* Social Links */}
      <div className="flex items-start space-x-3">
        <svg className="w-5 h-5 text-gray-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <div className="flex flex-wrap gap-3">
          {user.instagramUrl && (
            <a href={user.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-600 hover:underline">
              <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="text-sm">
                {extractUsername(user.instagramUrl, 'instagram') || 'Instagram'}
              </span>
            </a>
          )}
          {user.twitterUrl && (
            <a href={user.twitterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-600 hover:underline">
              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span className="text-sm">
                {extractUsername(user.twitterUrl, 'twitter') || 'Twitter'}
              </span>
            </a>
          )}
          {user.facebookUrl && (
            <a href={user.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-600 hover:underline">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-sm">
                {extractUsername(user.facebookUrl, 'facebook') || 'Facebook'}
              </span>
            </a>
          )}
          {!user.instagramUrl && !user.twitterUrl && !user.facebookUrl && !user.linkedinUrl && (
            <p className="text-gray-500 text-sm">No social links added yet</p>
          )}
        </div>
      </div>
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

// Posts section component
const PostsSection = ({ user }: { user: ProfileData }) => {
  const { data: posts, isLoading: postsLoading } = useUserPosts(user.id);
  const toggleLikeMutation = useTogglePostLike();
  const addCommentMutation = useAddPostComment();
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Helper function to format dates consistently
  const formatDate = (dateString: string) => {
    if (!isHydrated) return ''; // Return empty during SSR to avoid hydration mismatch
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleLike = async (postId: string) => {
    try {
      await toggleLikeMutation.mutateAsync(postId);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    try {
      await addCommentMutation.mutateAsync({ postId, content });
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleCommentInputChange = (postId: string, value: string) => {
    setCommentInputs(prev => ({ ...prev, [postId]: value }));
  };

  const toggleComments = (postId: string) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  if (postsLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold">
            {user.name?.charAt(0)?.toUpperCase()}
          </div>
          <input 
            type="text" 
            placeholder="What's on your mind?" 
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-gray-600 cursor-pointer hover:bg-gray-200 transition-colors"
            readOnly
          />
        </div>
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="text-sm font-medium">Live video</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
              <span className="text-sm font-medium">Photo/video</span>
            </button>
          </div>
        </div>
      </div>

      {posts && posts.length > 0 ? (
        posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-sm border">
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold">
                  {post.author.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{post.author.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(post.createdAt)} • 📷
                  </p>
                </div>
              </div>
              {post.caption && (
                <p className="text-gray-800 mb-3">{post.caption}</p>
              )}
              {post.content && (
                <p className="text-gray-800 mb-3">{post.content}</p>
              )}
            </div>
            {/* Media content */}
            {post.mediaUrl && (
              <div className="w-full aspect-[1.2/1] bg-gray-100 overflow-hidden">
                {post.type === 'PHOTO' ? (
                  <Image
                    src={post.mediaUrl}
                    alt="Post content"
                    width={600}
                    height={500}
                    className="w-full h-full object-cover"
                  />
                ) : post.type === 'VIDEO' ? (
                  <video
                    src={post.mediaUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
            )}
            <div className="p-4">
              {/* Like and comment counts */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <span>{post._count.likes} likes</span>
                <span>{post._count.comments} comments</span>
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center justify-between text-gray-500 border-t pt-3">
                <button 
                  onClick={() => handleLike(post.id)}
                  disabled={toggleLikeMutation.isPending}
                  className="flex items-center space-x-2 hover:text-blue-600 transition-colors disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>Like</span>
                </button>
                <button 
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center space-x-2 hover:text-blue-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Comment</span>
                </button>
                <button className="flex items-center space-x-2 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span>Share</span>
                </button>
              </div>

              {/* Comments section */}
              {showComments[post.id] && (
                <div className="mt-4 border-t pt-4 space-y-3">
                  {/* Existing comments */}
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
                        {comment.user.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2">
                        <p className="font-medium text-sm text-gray-900">{comment.user.name}</p>
                        <p className="text-gray-800 text-sm">{comment.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Add comment input */}
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1 flex space-x-2">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => handleCommentInputChange(post.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddComment(post.id);
                          }
                        }}
                        className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={addCommentMutation.isPending || !commentInputs[post.id]?.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
          <p className="text-gray-500">Upload photos and videos to see them here in chronological order.</p>
        </div>
      )}
    </div>
  );
};

// Helper functions to extract usernames from social media URLs
const extractUsername = (url: string, platform: string): string => {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    switch (platform) {
      case 'instagram':
        // Instagram: https://instagram.com/username or https://www.instagram.com/username
        const instagramMatch = pathname.match(/^\/([^\/]+)\/?$/);
        return instagramMatch ? instagramMatch[1] : '';
      
      case 'twitter':
        // Twitter/X: https://twitter.com/username or https://x.com/username
        const twitterMatch = pathname.match(/^\/([^\/]+)\/?$/);
        return twitterMatch ? twitterMatch[1] : '';
      
      case 'facebook':
        // Facebook: https://facebook.com/username
        const facebookMatch = pathname.match(/^\/([^\/]+)\/?$/);
        return facebookMatch ? facebookMatch[1] : '';
      
      default:
        return '';
    }
  } catch {
    return '';
  }
};

// Media tab content component with sub-tabs
const MediaTabContent = ({ user }: { user: ProfileData }) => {
  const [mediaActiveTab, setMediaActiveTab] = useState('photos');
  
  const mediaTabs = [
    { id: 'photos', name: 'Your photos' },
    { id: 'videos', name: 'Your videos' }
  ];

  return (
    <div className="space-y-6">
      {/* Media Sub-tabs */}
      <div className="bg-white border-b">
        <nav className="flex space-x-8">
          {mediaTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMediaActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                mediaActiveTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Media Content */}
      {mediaActiveTab === 'photos' && <PhotoGallerySection user={user} />}
      {mediaActiveTab === 'videos' && <VideoGallerySection user={user} />}
    </div>
  );
};

export default function ProfilePage() {
  const { data: user, isLoading, error, refetch } = useProfile();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modal states
  const [showBasicInfoModal, setShowBasicInfoModal] = useState(false);
  const [showPrivacySettingsModal, setShowPrivacySettingsModal] = useState(false);
  const [showSportsPreferencesModal, setShowSportsPreferencesModal] = useState(false);
  
  // Mutations
  const updateBasicInfoMutation = useUpdateBasicInfo();
  const updatePrivacySettingsMutation = useUpdatePrivacySettings();
  const updateSportsPreferencesMutation = useUpdateSportsPreferences();
  const updateAvailabilityMutation = useUpdateAvailability();
  
  // Upload mutations
  // Availability state - initialize with empty state first, then update when user data loads
  const [availabilityData, setAvailabilityData] = useState<{
    selectedDays: string[];
    timeRange: { start: string; end: string };
    willingToJoinTeams: boolean;
  }>({
    selectedDays: [],
    timeRange: { start: '09:00', end: '18:00' },
    willingToJoinTeams: true,
  });
  const [isEditingAvailability, setIsEditingAvailability] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Update availability data when user data changes
  useEffect(() => {
    if (user) {
      const extendedUser = user as ProfileData & {
        selectedDays?: string[];
        timeRange?: { start: string; end: string };
        willingToJoinTeams?: boolean;
        weeklyAvailability?: { [key: string]: string[] };
      };
      
      // Try to load from either new format or old format
      const selectedDays = extendedUser.selectedDays || 
        (extendedUser.weeklyAvailability ? Object.keys(extendedUser.weeklyAvailability) : []);
      
      setAvailabilityData({
        selectedDays: selectedDays,
        timeRange: extendedUser.timeRange || { start: '09:00', end: '18:00' },
        willingToJoinTeams: extendedUser.willingToJoinTeams ?? true,
      });
    }
  }, [user]);

  // Modal handlers
  const handleEditBasicInfo = () => setShowBasicInfoModal(true);
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

  // Availability handler
  const handleSaveAvailability = async () => {
    try {
      await updateAvailabilityMutation.mutateAsync(availabilityData);
      
      // Keep the current state since we know it's correct
      const currentAvailabilityData = { ...availabilityData };
      
      // Refetch user data to get updated availability
      await refetch();
      
      // Force update the availability state to ensure UI shows correctly
      setTimeout(() => {
        setAvailabilityData(currentAvailabilityData);
      }, 100);
      
      setIsEditingAvailability(false);
    } catch (error) {
      console.error('Failed to update availability:', error);
      alert('Failed to update availability. Please try again.');
    }
  };


  const handleTimeRangeChange = (field: 'start' | 'end', value: string) => {
    setAvailabilityData(prev => ({
      ...prev,
      timeRange: {
        ...prev.timeRange,
        [field]: value
      }
    }));
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
    { id: 'sports', name: 'Sports Preferences' },
    { id: 'achievements', name: 'Achievements' },
    { id: 'availability', name: 'Availability' },
    { id: 'media', name: 'Media' },
    { id: 'privacy', name: 'Privacy' },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AppNavbar />

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Sidebar */}
              <div className="lg:col-span-1 space-y-6">
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
              
              {/* Main Posts Feed */}
              <div className="lg:col-span-2">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Posts</h2>
                  <p className="text-gray-600">Your photos and videos </p>
                </div>
                <PostsSection user={user} />
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
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {!isHydrated ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Availability Settings</h3>
                    <button 
                      onClick={() => setIsEditingAvailability(!isEditingAvailability)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {isEditingAvailability ? 'Cancel' : 'Edit Availability'}
                    </button>
                  </div>
              
              {isEditingAvailability ? (
                <div className="space-y-6">
                  {/* Days Selection */}
                  <div>
                    <h4 className="text-md font-semibold mb-4 text-gray-800">Select Available Days</h4>
                    <div className="grid grid-cols-7">
                      {[
                        { day: 'Monday', short: 'M' },
                        { day: 'Tuesday', short: 'T' },
                        { day: 'Wednesday', short: 'W' },
                        { day: 'Thursday', short: 'T' },
                        { day: 'Friday', short: 'F' },
                        { day: 'Saturday', short: 'S' },
                        { day: 'Sunday', short: 'S' }
                      ].map(({ day, short }) => {
                        const isSelected = availabilityData.selectedDays.includes(day);
                        return (
                          <button
                            key={day}
                            onClick={(e) => {
                              e.preventDefault();
                              setAvailabilityData(prevData => {
                                const newSelectedDays = prevData.selectedDays.includes(day)
                                  ? prevData.selectedDays.filter(d => d !== day)
                                  : [...prevData.selectedDays, day];
                                
                                return {
                                  ...prevData,
                                  selectedDays: newSelectedDays
                                };
                              });
                            }}
                            className={`h-12 w-12 rounded-md text-white font-bold text-sm transition-all duration-200 ${
                              isSelected 
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-gray-300 hover:bg-gray-400 text-gray-600'
                            }`}
                            type="button"
                          >
                            {short}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-2 text-xs text-gray-500 text-center">
                      Click days when you&apos;re generally available
                    </div>
                  </div>
                  
                  {/* Time Range */}
                  <div>
                    <h4 className="text-md font-semibold mb-4 text-gray-800">Available Time Range</h4>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                        <input
                          type="time"
                          value={availabilityData.timeRange.start}
                          onChange={(e) => handleTimeRangeChange('start', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                        <input
                          type="time"
                          value={availabilityData.timeRange.end}
                          onChange={(e) => handleTimeRangeChange('end', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Set your general availability window on selected days
                    </div>
                  </div>
                  
                  {/* Team Joining */}
                  <div>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox"
                        checked={availabilityData.willingToJoinTeams}
                        onChange={(e) => setAvailabilityData(prev => ({
                          ...prev,
                          willingToJoinTeams: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Willing to join new teams
                      </span>
                    </label>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button 
                      onClick={handleSaveAvailability}
                      disabled={updateAvailabilityMutation.isPending}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {updateAvailabilityMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      onClick={() => setIsEditingAvailability(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Available Days Display */}
                  <div>
                    <h4 className="text-md font-semibold mb-4 text-gray-800">Available Days</h4>
                    <div className="grid grid-cols-7 mb-4">
                      {[
                        { day: 'Monday', short: 'M' },
                        { day: 'Tuesday', short: 'T' },
                        { day: 'Wednesday', short: 'W' },
                        { day: 'Thursday', short: 'T' },
                        { day: 'Friday', short: 'F' },
                        { day: 'Saturday', short: 'S' },
                        { day: 'Sunday', short: 'S' }
                      ].map(({ day, short }) => {
                        const isSelected = availabilityData.selectedDays.includes(day);
                        return (
                          <div
                            key={day}
                            className={`h-12 w-12 rounded-md font-bold text-sm flex items-center justify-center ${
                              isSelected 
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-400'
                            }`}
                          >
                            {short}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availabilityData.selectedDays.length > 0 ? (
                        availabilityData.selectedDays.map((day) => (
                          <span 
                            key={day}
                            className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full border border-green-200"
                          >
                            {day}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No days selected</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Time Range Display */}
                  <div>
                    <h4 className="text-md font-semibold mb-2 text-gray-800">Available Time Range</h4>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-lg font-medium">
                        {availabilityData.timeRange.start} - {availabilityData.timeRange.end}
                      </span>
                    </div>
                  </div>
                  
                  {/* Team Joining Status */}
                  <div className="flex justify-between items-center py-3 border-t border-gray-200">
                    <span className="font-medium text-gray-800">Willing to join teams:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      availabilityData.willingToJoinTeams 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {availabilityData.willingToJoinTeams ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              )}
                </>
              )}
            </div>
          )}

          {activeTab === 'media' && (
            <MediaTabContent user={user} />
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

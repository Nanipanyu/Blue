'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

export interface ProfileData {
  id: string;
  email: string;
  name: string;
  phone?: string;
  region: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Extended profile fields (will be available after migration)
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  city?: string;
  country?: string;
  emailVisibility?: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY';
  instagramUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  favoriteSports?: string[];
  preferredPositions?: string[];
  skillLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL';
  playingExperience?: number;
  coachingExperience?: boolean;
  totalMatches?: number;
  totalWins?: number;
  totalGoals?: number;
  totalAssists?: number;
  weeklyAvailability?: Record<string, string[]>;
  willingToJoinTeams?: boolean;
  photoGallery?: string[];
  highlightVideos?: string[];
  profileVisibility?: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY';
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  qrCode?: string;
  favoriteTeams?: string[];
  favoritePlayers?: string[];
  isVerified?: boolean;
  profileCompleted?: boolean;
}

export interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  icon?: string;
  dateEarned: string;
  createdAt: string;
}

export interface Trophy {
  id: string;
  type: string;
  title: string;
  description: string;
  icon?: string;
  dateEarned: string;
  event?: string;
  position?: string;
  createdAt: string;
}

// Get current user profile
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        // Check if user is authenticated first
        if (!apiClient.isAuthenticated()) {
          throw new Error('User not authenticated');
        }
        
        const response = await apiClient.getMyProfile();
        if (!response || !response.data) {
          throw new Error('No profile data received');
        }
        return response.data as ProfileData;
      } catch (error) {
        console.error('Profile fetch error:', error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error && typeof error === 'object' && 'message' in error) {
        if (error.message === 'User not authenticated' || 
            error.message?.includes('401') || 
            error.message?.includes('Unauthorized')) {
          return false;
        }
      }
      return failureCount < 3;
    },
  });
};

// Get public profile by user ID
export const usePublicProfile = (userId: string) => {
  return useQuery({
    queryKey: ['publicProfile', userId],
    queryFn: async () => {
      const response = await apiClient.getPublicProfile(userId);
      return response.data as ProfileData;
    },
    enabled: !!userId,
  });
};

// Update basic profile info
export const useUpdateBasicInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ProfileData>) => {
      const response = await apiClient.updateBasicInfo(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

// Update social links
export const useUpdateSocialLinks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      instagramUrl?: string;
      twitterUrl?: string;
      facebookUrl?: string;
      linkedinUrl?: string;
    }) => {
      const response = await apiClient.updateSocialLinks(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

// Update sports preferences
export const useUpdateSportsPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      favoriteSports?: string[];
      preferredPositions?: string[];
      skillLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL';
      playingExperience?: number;
      coachingExperience?: boolean;
      favoriteTeams?: string[];
      favoritePlayers?: string[];
    }) => {
      const response = await apiClient.updateSportsPreferences(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

// Update availability
export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      weeklyAvailability?: Record<string, string[]>;
      willingToJoinTeams?: boolean;
    }) => {
      const response = await apiClient.updateAvailability(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

// Update media
export const useUpdateMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      photoGallery?: string[];
      highlightVideos?: string[];
    }) => {
      const response = await apiClient.updateMedia(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

// Update privacy settings
export const useUpdatePrivacySettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      profileVisibility?: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY';
      emailVisibility?: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY';
      emailNotifications?: boolean;
      pushNotifications?: boolean;
    }) => {
      const response = await apiClient.updatePrivacySettings(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

// Generate QR Code
export const useGenerateQRCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.generateQRCode();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

// Add achievement
export const useAddAchievement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      type: string;
      title: string;
      description: string;
      icon?: string;
      dateEarned: string;
    }) => {
      const response = await apiClient.addAchievement(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

// Add trophy
export const useAddTrophy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      type: string;
      title: string;
      description: string;
      icon?: string;
      dateEarned: string;
      event?: string;
      position?: string;
    }) => {
      const response = await apiClient.addTrophy(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

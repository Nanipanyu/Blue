'use client';

import React from 'react';
import { ProfileData } from '../hooks/useProfile';
import { useUserVideos } from '../hooks/usePosts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

interface VideoGallerySectionProps {
  user: ProfileData;
}

export function VideoGallerySection({ user }: VideoGallerySectionProps) {
  const queryClient = useQueryClient();
  const { data: videoPosts, isLoading } = useUserVideos(user.id);

  const uploadVideosMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('videos', file);
      });
      
      const response = await apiClient.uploadVideos(formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos', user.id] });
      queryClient.invalidateQueries({ queryKey: ['posts', user.id] });
    },
    onError: (error) => {
      console.error('Video upload failed:', error);
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiClient.deletePost(postId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos', user.id] });
      queryClient.invalidateQueries({ queryKey: ['posts', user.id] });
    },
  });

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const filesArray = Array.from(event.target.files);
      uploadVideosMutation.mutate(filesArray);
      event.target.value = '';
    }
  };

  const handleRemoveVideo = (postId: string) => {
    if (confirm('Are you sure you want to remove this video?')) {
      deletePostMutation.mutate(postId);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-black">Videos</h2>
        <div className="flex items-center space-x-3">
          <input
            type="file"
            id="video-upload"
            multiple
            accept="video/*"
            onChange={handleVideoUpload}
            className="hidden"
          />
          <label
            htmlFor="video-upload"
            className=" text-green-600 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors cursor-pointer text-l font-medium"
          >
            Add Videos
          </label>
        </div>
      </div>
      
      {uploadVideosMutation.isPending && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700">Uploading videos...</p>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videoPosts && videoPosts.length > 0 ? (
            videoPosts.map((post) => (
              <div key={post.id} className="relative group">
                <div className="w-full aspect-[1.2/1] bg-gray-100 rounded-lg overflow-hidden">
                  <video
                    src={post.mediaUrl!}
                    controls
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <button
                  onClick={() => handleRemoveVideo(post.id)}
                  disabled={deletePostMutation.isPending}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              No videos uploaded yet. Click &quot;Upload Videos&quot; to add your first highlight video.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

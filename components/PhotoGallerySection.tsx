'use client';

import React from 'react';
import Image from 'next/image';
import { ProfileData } from '../hooks/useProfile';
import { useUserPhotos } from '../hooks/usePosts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

interface PhotoGallerySectionProps {
  user: ProfileData;
}

export function PhotoGallerySection({ user }: PhotoGallerySectionProps) {
  const queryClient = useQueryClient();
  const { data: photoPosts, isLoading } = useUserPhotos(user.id);

  const uploadPhotosMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('photos', file);
      });
      
      const response = await apiClient.uploadPhotos(formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos', user.id] });
      queryClient.invalidateQueries({ queryKey: ['posts', user.id] });
    },
    onError: (error) => {
      console.error('Photo upload failed:', error);
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiClient.deletePost(postId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos', user.id] });
      queryClient.invalidateQueries({ queryKey: ['posts', user.id] });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      uploadPhotosMutation.mutate(event.target.files);
      event.target.value = '';
    }
  };

  const handleRemovePhoto = (postId: string) => {
    if (confirm('Are you sure you want to remove this photo?')) {
      deletePostMutation.mutate(postId);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl text-black font-semibold">Photos</h2>
        <div className="flex items-center space-x-3">
          <input
            type="file"
            id="photo-upload"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="photo-upload"
            className=" text-blue-600 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors cursor-pointer text-l font-medium"
          >
            Add Photos
          </label>
        </div>
      </div>
      
      {uploadPhotosMutation.isPending && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-700">Uploading photos...</p>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photoPosts && photoPosts.length > 0 ? (
            photoPosts.map((post) => (
              <div key={post.id} className="relative group">
                <div className="w-full aspect-[1.2/1] bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={post.mediaUrl!}
                    alt="Photo"
                    width={250}
                    height={208}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  />
                </div>
                <button
                  onClick={() => handleRemovePhoto(post.id)}
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
              No photos uploaded yet. Click &quot;Upload Photos&quot; to add your first photo.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

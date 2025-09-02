'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { Post, CreatePostRequest } from '../lib/types';

// Get user posts with optional filtering
export const useUserPosts = (userId: string, type?: 'PHOTO' | 'VIDEO' | 'TEXT') => {
  return useQuery({
    queryKey: ['posts', userId, type],
    queryFn: async () => {
      const response = await apiClient.getUserPosts(userId, type);
      return response.data as Post[];
    },
    enabled: !!userId,
  });
};

// Specific hooks for different content types
export const useUserPhotos = (userId: string) => {
  return useQuery({
    queryKey: ['photos', userId],
    queryFn: async () => {
      const response = await apiClient.getUserPhotos(userId);
      return response.data as Post[];
    },
    enabled: !!userId,
  });
};

export const useUserVideos = (userId: string) => {
  return useQuery({
    queryKey: ['videos', userId],
    queryFn: async () => {
      const response = await apiClient.getUserVideos(userId);
      return response.data as Post[];
    },
    enabled: !!userId,
  });
};

// Create post
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePostRequest) => {
      const response = await apiClient.createPost(data);
      return response.data as Post;
    },
    onSuccess: (newPost) => {
      // Update the posts cache
      queryClient.invalidateQueries({ queryKey: ['posts', newPost.authorId] });
    },
  });
};

// Toggle post like
export const useTogglePostLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiClient.togglePostLike(postId);
      return response.data;
    },
    onSuccess: (data, postId) => {
      // Update posts cache optimistically
      if (data) {
        queryClient.setQueriesData({ queryKey: ['posts'] }, (oldData: Post[] | undefined) => {
          if (!oldData) return oldData;
          
          return oldData.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                _count: {
                  ...post._count,
                  likes: data.likeCount
                }
              };
            }
            return post;
          });
        });
      }
    },
  });
};

// Add comment to post
export const useAddPostComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const response = await apiClient.addPostComment(postId, content);
      return response.data;
    },
    onSuccess: (newComment, { postId }) => {
      // Update posts cache with new comment
      queryClient.setQueriesData({ queryKey: ['posts'] }, (oldData: Post[] | undefined) => {
        if (!oldData) return oldData;
        
        return oldData.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [...post.comments, newComment],
              _count: {
                ...post._count,
                comments: post._count.comments + 1
              }
            };
          }
          return post;
        });
      });
    },
  });
};

// Delete comment
export const useDeletePostComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const response = await apiClient.deletePostComment(commentId);
      return response.data;
    },
    onSuccess: (data, commentId) => {
      // Update posts cache by removing the comment
      queryClient.setQueriesData({ queryKey: ['posts'] }, (oldData: Post[] | undefined) => {
        if (!oldData) return oldData;
        
        return oldData.map(post => ({
          ...post,
          comments: post.comments.filter(comment => comment.id !== commentId),
          _count: {
            ...post._count,
            comments: post.comments.filter(comment => comment.id !== commentId).length
          }
        }));
      });
    },
  });
};

// Delete post
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiClient.deletePost(postId);
      return response.data;
    },
    onSuccess: (data, postId) => {
      // Remove post from cache
      queryClient.setQueriesData({ queryKey: ['posts'] }, (oldData: Post[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.filter(post => post.id !== postId);
      });
    },
  });
};

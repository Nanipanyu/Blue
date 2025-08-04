import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { queryKeys } from '../lib/queryClient';
import { NotificationFilters, Notification, ApiResponse } from '../lib/types';

// Get Notifications Query
export const useNotifications = (filters?: NotificationFilters) => {
  return useQuery({
    queryKey: queryKeys.notifications.list(filters),
    queryFn: () => apiClient.getNotifications(filters),
    staleTime: 10 * 1000, // 10 seconds - notifications are time-sensitive
    refetchInterval: 30 * 1000, // Poll every 30 seconds for real-time updates
  });
};

// Mark Notification as Read Mutation
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationId: string) => apiClient.markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.lists() });
    },
    // Optimistic update for instant UI feedback
    onMutate: async (notificationId: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.lists() });
      
      const previousNotifications = queryClient.getQueryData(queryKeys.notifications.list());
      
      queryClient.setQueryData(queryKeys.notifications.list(), (old: ApiResponse<{
        notifications: Notification[];
        unreadCount: number;
        pagination?: Record<string, unknown>;
      }> | undefined) => {
        if (!old?.data?.notifications) return old;
        return {
          ...old,
          data: {
            ...old.data,
            notifications: old.data.notifications.map((notification: Notification) =>
              notification.id === notificationId
                ? { ...notification, isRead: true }
                : notification
            ),
            unreadCount: Math.max(0, (old.data.unreadCount || 1) - 1),
          },
        };
      });
      
      return { previousNotifications };
    },
    onError: (err, notificationId, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(queryKeys.notifications.list(), context.previousNotifications);
      }
    },
  });
};

// Mark All Notifications as Read Mutation
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiClient.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.lists() });
    },
    // Optimistic update
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.lists() });
      
      const previousNotifications = queryClient.getQueryData(queryKeys.notifications.list());
      
      queryClient.setQueryData(queryKeys.notifications.list(), (old: ApiResponse<{
        notifications: Notification[];
        unreadCount: number;
        pagination?: Record<string, unknown>;
      }> | undefined) => {
        if (!old?.data?.notifications) return old;
        return {
          ...old,
          data: {
            ...old.data,
            notifications: old.data.notifications.map((notification: Notification) => ({
              ...notification,
              isRead: true,
            })),
            unreadCount: 0,
          },
        };
      });
      
      return { previousNotifications };
    },
  });
};

// Delete Notification Mutation
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationId: string) => apiClient.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.lists() });
    },
    // Optimistic update
    onMutate: async (notificationId: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.lists() });
      
      const previousNotifications = queryClient.getQueryData(queryKeys.notifications.list());
      
      queryClient.setQueryData(queryKeys.notifications.list(), (old: ApiResponse<{
        notifications: Notification[];
        unreadCount: number;
        pagination?: Record<string, unknown>;
      }> | undefined) => {
        if (!old?.data?.notifications) return old;
        
        const deletedNotification = old.data.notifications.find((n: Notification) => n.id === notificationId);
        const wasUnread = deletedNotification && !deletedNotification.isRead;
        
        return {
          ...old,
          data: {
            ...old.data,
            notifications: old.data.notifications.filter((notification: Notification) => 
              notification.id !== notificationId
            ),
            unreadCount: wasUnread 
              ? Math.max(0, (old.data.unreadCount || 1) - 1)
              : old.data.unreadCount,
          },
        };
      });
      
      return { previousNotifications };
    },
  });
};

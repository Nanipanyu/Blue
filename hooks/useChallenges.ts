import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { queryKeys } from '../lib/queryClient';
import { CreateChallengeRequest, RespondToChallengeRequest, Challenge, ApiResponse } from '../lib/types';

// Get My Challenges Query
export const useMyChallenges = () => {
  return useQuery({
    queryKey: queryKeys.challenges.my(),
    queryFn: () => apiClient.getMyChallenges(),
    staleTime: 30 * 1000, // 30 seconds - challenges change frequently
    refetchInterval: 60 * 1000, // Poll every minute
  });
};

// Get Pending Challenges Query
export const usePendingChallenges = () => {
  return useQuery({
    queryKey: queryKeys.challenges.pending(),
    queryFn: () => apiClient.getPendingChallenges(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Poll every minute
  });
};

// Create Challenge Mutation
export const useCreateChallenge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (challengeData: CreateChallengeRequest) => apiClient.createChallenge(challengeData),
    onSuccess: () => {
      // Invalidate challenge lists
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges.lists() });
      // Invalidate notifications (new challenge creates notification)
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.lists() });
    },
  });
};

// Respond to Challenge Mutation
export const useRespondToChallenge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ challengeId, response }: { challengeId: string; response: RespondToChallengeRequest }) =>
      apiClient.respondToChallenge(challengeId, response),
    onSuccess: () => {
      // Invalidate multiple related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() }); // Team stats might change
    },
    // Optimistic update for instant UI feedback
    onMutate: async ({ challengeId, response }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.challenges.lists() });
      
      // Snapshot the previous value
      const previousChallenges = queryClient.getQueryData(queryKeys.challenges.my());
      
      // Optimistically update the challenge status
      queryClient.setQueryData(queryKeys.challenges.my(), (old: ApiResponse<Challenge[]> | undefined) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((challenge: Challenge) =>
            challenge.id === challengeId
              ? { ...challenge, status: response.response === 'accepted' ? 'ACCEPTED' : 'DECLINED' }
              : challenge
          ),
        };
      });
      
      return { previousChallenges };
    },
    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousChallenges) {
        queryClient.setQueryData(queryKeys.challenges.my(), context.previousChallenges);
      }
    },
  });
};

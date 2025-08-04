import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { queryKeys } from '../lib/queryClient';
import { CreateMatchRequest, MatchFilters } from '../lib/types';

// Get Team Matches Query
export const useTeamMatches = (teamId: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: queryKeys.matches.teamMatches(teamId),
    queryFn: () => apiClient.getTeamMatches(teamId, page, limit),
    enabled: !!teamId,
    staleTime: 1 * 60 * 1000, // 1 minute for match data
    refetchInterval: 2 * 60 * 1000, // Poll every 2 minutes
  });
};

// Get Match by ID Query
export const useMatch = (matchId: string) => {
  return useQuery({
    queryKey: queryKeys.matches.detail(matchId),
    queryFn: () => apiClient.getMatchById(matchId),
    enabled: !!matchId,
    staleTime: 30 * 1000, // 30 seconds for individual match
  });
};

// Get Recent Matches Query
export const useRecentMatches = (filters?: MatchFilters) => {
  return useQuery({
    queryKey: queryKeys.matches.recent(filters),
    queryFn: () => apiClient.getRecentMatches(filters),
    staleTime: 30 * 1000, // 30 seconds for recent matches
    refetchInterval: 60 * 1000, // Poll every minute for live updates
  });
};

// Create Match Mutation
export const useCreateMatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (matchData: CreateMatchRequest) => apiClient.createMatch(matchData),
    onSuccess: () => {
      // Invalidate multiple related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() }); // Team stats change
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges.lists() }); // Challenge status changes
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.lists() }); // New notifications
    },
  });
};

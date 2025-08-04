import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { queryKeys } from '../lib/queryClient';
import { TeamFilters, CreateTeamRequest } from '../lib/types';

// Get Teams Query
export const useTeams = (filters?: TeamFilters) => {
  return useQuery({
    queryKey: queryKeys.teams.list(filters),
    queryFn: () => apiClient.getTeams(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes for team data
  });
};

// Get Team by ID Query
export const useTeam = (teamId: string) => {
  return useQuery({
    queryKey: queryKeys.teams.detail(teamId),
    queryFn: () => apiClient.getTeamById(teamId),
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000, // 5 minutes for individual team
  });
};

// Get My Teams Query
export const useMyTeams = () => {
  return useQuery({
    queryKey: queryKeys.teams.myTeams,
    queryFn: () => apiClient.getMyTeams(),
    staleTime: 1 * 60 * 1000, // 1 minute for user's own teams
  });
};

// Get Team Stats Query
export const useTeamStats = (teamId: string) => {
  return useQuery({
    queryKey: queryKeys.teams.stats(teamId),
    queryFn: () => apiClient.getTeamStats(teamId),
    enabled: !!teamId,
    staleTime: 30 * 1000, // 30 seconds for stats (frequently changing)
  });
};

// Create Team Mutation
export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (teamData: CreateTeamRequest) => apiClient.createTeam(teamData),
    onSuccess: () => {
      // Invalidate teams lists
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.myTeams });
    },
  });
};

// Update Team Mutation
export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTeamRequest> }) =>
      apiClient.updateTeam(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific team and lists
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.myTeams });
    },
  });
};

// Delete Team Mutation
export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (teamId: string) => apiClient.deleteTeam(teamId),
    onSuccess: (_, teamId) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: queryKeys.teams.detail(teamId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.myTeams });
    },
  });
};

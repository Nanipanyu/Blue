import { QueryClient } from '@tanstack/react-query';
import { TeamFilters, MatchFilters, NotificationFilters } from './types';


// setting up and organizing React Query (from @tanstack/react-query) for your application

// This queryClient object is the central engine of React Query. You provide it to your app (usually via <QueryClientProvider>) so that it can manage:
// Cached data
// Background fetching
// Retrying failed requests
// Auto refetching, etc.

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, //data is refreshed 5 minutes
      gcTime: 10 * 60 * 1000, // unused cached data will be garbage in 10 minutes (formerly cacheTime)
      retry: 3,
      refetchOnWindowFocus: true, // Refetch when user switches back to the tab
      refetchOnMount: true,       // Refetch when the component mounts again
      refetchOnReconnect: true,   // Refetch when the user reconnects to the internet
    },
    mutations: {
      retry: 1,                  // 	Retry once if mutation (POST/PUT/DELETE) fails
      onError: (error: Error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

// Query keys factory structured way to generate consistent query keys across your app. for consistent key management
//Query key : unique identifier for each query in React Query

// Helper to get current user ID for user-specific caching
const getCurrentUserId = () => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.id;
      } catch {
        return null;
      }
    }
  }
  return null;
};

export const queryKeys = {
  // Auth
  auth: {
    profile: ['auth', 'profile'] as const,
  },
  
  //Query Keys
  // Teams
  teams: {
    all: ['teams'] as const,
    lists: () => [...queryKeys.teams.all, 'list'] as const,
    list: (filters?: TeamFilters) => [...queryKeys.teams.lists(), { filters }] as const,
    details: () => [...queryKeys.teams.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.teams.details(), id] as const,
    myTeams: ['teams', 'my', getCurrentUserId()] as const,
    stats: (id: string) => [...queryKeys.teams.detail(id), 'stats'] as const,
  },
  
  // Challenges
  challenges: {
    all: ['challenges'] as const,
    lists: () => [...queryKeys.challenges.all, 'list'] as const,
    my: () => [...queryKeys.challenges.lists(), 'my', getCurrentUserId()] as const,
    pending: () => [...queryKeys.challenges.lists(), 'pending', getCurrentUserId()] as const,
  },
  
  // Matches
  matches: {
    all: ['matches'] as const,
    lists: () => [...queryKeys.matches.all, 'list'] as const,
    recent: (filters?: MatchFilters) => [...queryKeys.matches.lists(), 'recent', getCurrentUserId(), { filters }] as const,
    teamMatches: (teamId: string) => [...queryKeys.matches.lists(), 'team', teamId] as const,
    detail: (id: string) => [...queryKeys.matches.all, 'detail', id] as const,
  },
  
  // Notifications
  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeys.notifications.all, 'list'] as const,
    list: (filters?: NotificationFilters) => [...queryKeys.notifications.lists(), getCurrentUserId(), { filters }] as const,
  },
};

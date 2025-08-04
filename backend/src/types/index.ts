// serves as a centralized type definitions hub(typescript) for your entire backend application.

import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthTokenPayload {
  id: string;
  email: string;
  name: string;
}

export interface CreateTeamRequest {
  name: string;
  sport: string;
  region: string;
  description?: string;
  maxPlayers: number;
  contactEmail: string;
  contactPhone: string;
}

export interface CreateChallengeRequest {
  toTeamId: string;
  proposedDate: string;
  proposedTime: string;
  venue?: string;
  message?: string;
}

export interface UpdateMatchResultRequest {
  homeScore: number;
  awayScore: number;
}

export interface TeamFilters {
  sport?: string;
  region?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface DashboardStats {
  totalTeams: number;
  pendingChallenges: number;
  totalWins: number;
  averageRating: number;
  recentActivities: RecentActivity[];
}

export interface RecentActivity {
  id: string;
  type: 'match_won' | 'match_lost' | 'challenge_received' | 'match_scheduled';
  message: string;
  date: Date;
  metadata?: Record<string, unknown>;
}

export const SPORTS = [
  'Football',
  'Basketball',
  'Cricket',
  'Volleyball',
  'Tennis',
  'Badminton',
  'Table Tennis',
  'Hockey',
  'Baseball',
  'Rugby'
] as const;

export const REGIONS = [
  'North America',
  'South America',
  'Europe',
  'Asia',
  'Africa',
  'Oceania'
] as const;

export type Sport = typeof SPORTS[number];
export type Region = typeof REGIONS[number];

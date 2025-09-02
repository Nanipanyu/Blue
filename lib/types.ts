// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  region: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Profile Information
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  city?: string;
  country?: string;
  
  // Contact & Social
  emailVisibility?: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY';
  instagramUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  
  // Sports Preferences
  favoriteSports?: string[];
  preferredPositions?: string[];
  skillLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL';
  
  // Personal Stats
  totalMatches?: number;
  totalWins?: number;
  totalGoals?: number;
  totalAssists?: number;
  
  // Availability
  weeklyAvailability?: Record<string, string[]>; // {monday: ["09:00-12:00"], tuesday: [], ...}
  willingToJoinTeams?: boolean;
  
  // Settings
  profileVisibility?: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY';
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  
  // Additional Features
  qrCode?: string;
  favoriteTeams?: string[];
  favoritePlayers?: string[];
  isVerified?: boolean;
  profileCompleted?: boolean;
  
  // Relations
  achievements?: Achievement[];
  trophies?: Trophy[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  region: string;
  phone?: string;
}

// Profile Update Request Types
export interface UpdateBasicInfoRequest {
  name?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  city?: string;
  country?: string;
  phone?: string;
}

export interface UpdateSocialLinksRequest {
  instagramUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
}

export interface UpdateSportsPreferencesRequest {
  favoriteSports?: string[];
  preferredPositions?: string[];
  skillLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL';
  favoriteTeams?: string[];
  favoritePlayers?: string[];
}

export interface UpdatePrivacySettingsRequest {
  profileVisibility?: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY';
  emailVisibility?: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY';
  emailNotifications?: boolean;
  pushNotifications?: boolean;
}

export interface UpdateAvailabilityRequest {
  weeklyAvailability?: Record<string, string[]>;
  willingToJoinTeams?: boolean;
}
export interface AddAchievementRequest {
  type: string;
  title: string;
  description: string;
  icon?: string;
}

export interface AddTrophyRequest {
  type: string;
  title: string;
  description: string;
  icon?: string;
  event?: string;
  position?: string;
}

// Team Types
export interface Team {
  id: string;
  name: string;
  sport: string;
  region: string;
  description?: string;
  maxPlayers: number;
  contactEmail: string;
  contactPhone: string;
  avatar?: string;
  isActive: boolean;
  wins: number;
  losses: number;
  draws: number;
  rating: number;
  matchesPlayed: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner?: User;
  members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: string;
  joinedAt: string;
  user?: User;
  team?: Team;
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

export interface TeamFilters {
  sport?: string;
  region?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Challenge Types
export interface Challenge {
  id: string;
  sport: string;
  proposedDate: string;
  proposedTime: string;
  venue?: string;
  message?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED';
  fromUserId: string;
  fromTeamId: string;
  toTeamId: string;
  createdAt: string;
  updatedAt: string;
  fromUser?: User;
  fromTeam?: Team;
  toTeam?: Team;
}

export interface CreateChallengeRequest {
  toTeamId: string;
  sport: string;
  proposedDate: string;
  proposedTime: string;
  venue?: string;
  message?: string;
}

export interface RespondToChallengeRequest {
  response: 'accepted' | 'declined';
}

// Match Types
export interface Match {
  id: string;
  sport: string;
  date: string;
  venue?: string;
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  homeScore?: number;
  awayScore?: number;
  winnerId?: string;
  homeRatingChange?: number;
  awayRatingChange?: number;
  challengeId: string;
  homeTeamId: string;
  awayTeamId: string;
  createdAt: string;
  updatedAt: string;
  challenge?: Challenge;
  homeTeam?: Team;
  awayTeam?: Team;
}

export interface CreateMatchRequest {
  challengeId: string;
  homeScore: number;
  awayScore: number;
  matchDate: string;
  venue?: string;
}

export interface MatchFilters {
  sport?: string;
  region?: string;
  limit?: number;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'CHALLENGE_RECEIVED' | 'CHALLENGE_ACCEPTED' | 'CHALLENGE_DECLINED' | 'MATCH_SCHEDULED' | 'MATCH_COMPLETED' | 'TEAM_INVITATION' | 'RATING_UPDATE';
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, unknown>;
  userId: string;
  createdAt: string;
}

export interface NotificationFilters {
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}

// Sports and Regions Constants
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
  'North District',
  'South District',
  'East District',
  'West District',
  'Central District',
  'Downtown',
  'Suburbs',
  'University Area',
  'Industrial Zone',
  'Coastal Area'
] as const;

export type Sport = typeof SPORTS[number];
export type Region = typeof REGIONS[number];

// Achievement and Trophy Types
export interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  icon?: string;
  dateEarned: string;
  userId: string;
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
  userId: string;
  createdAt: string;
}

// Post Types
export interface Post {
  id: string;
  type: 'PHOTO' | 'VIDEO' | 'TEXT';
  mediaUrl?: string;
  content?: string;
  caption?: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  likes: PostLike[];
  comments: PostComment[];
  _count: {
    likes: number;
    comments: number;
  };
}

export interface PostLike {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

export interface PostComment {
  id: string;
  content: string;
  userId: string;
  postId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface CreatePostRequest {
  mediaUrl: string;
  type: 'PHOTO' | 'VIDEO';
  caption?: string;
}

export interface PostLikeResponse {
  liked: boolean;
  likeCount: number;
}

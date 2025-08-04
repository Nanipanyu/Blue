import {
  ApiResponse,
  PaginatedResponse,
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateBasicInfoRequest,
  UpdateSocialLinksRequest,
  UpdateSportsPreferencesRequest,
  UpdatePrivacySettingsRequest,
  UpdateAvailabilityRequest,
  UpdateMediaRequest,
  AddAchievementRequest,
  AddTrophyRequest,
  Team,
  CreateTeamRequest,
  TeamFilters,
  Challenge,
  CreateChallengeRequest,
  RespondToChallengeRequest,
  Match,
  CreateMatchRequest,
  MatchFilters,
  Notification,
  NotificationFilters,
  Achievement,
  Trophy,
} from './types';

// Purpose of This Code
// Wraps all HTTP calls to your backend into clean methods

// Manages things like:
// API base URL
// Request headers
// Token (authentication)
// Error handling
// Local storage sync

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Get token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }
 
  //this is a custom helper method to handle API requests by wrapping fetch(), Automatically adds headers and token, Handles error messages,Makes all API calls consistent and reusable
  private async request<T>(endpoint: string,options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;  // Construct the full URL for the API endpoint
    const headers: Record<string, string> = {   // Set default headers for the request
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Token management
  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  // Refresh token from localStorage (useful for page refreshes)
  refreshToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window !== 'undefined' && !this.token) {
      this.refreshToken();
    }
    return !!this.token;
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<ApiResponse<AuthResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      this.setToken(response.data.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }

    return response;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<ApiResponse<AuthResponse>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      this.setToken(response.data.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    return response;
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/auth/profile');
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Team methods
  async getTeams(filters?: TeamFilters): Promise<ApiResponse<Team[]>> {
    const queryParams = new URLSearchParams();
    if (filters?.sport) queryParams.append('sport', filters.sport);
    if (filters?.region) queryParams.append('region', filters.region);
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());

    return this.request<ApiResponse<Team[]>>(`/teams?${queryParams}`);
  }

  async getTeamById(id: string): Promise<ApiResponse<Team>> {
    return this.request<ApiResponse<Team>>(`/teams/${id}`);
  }

  async createTeam(teamData: CreateTeamRequest): Promise<ApiResponse<Team>> {
    return this.request<ApiResponse<Team>>('/teams', {
      method: 'POST',
      body: JSON.stringify(teamData),
    });
  }

  async updateTeam(id: string, teamData: Partial<CreateTeamRequest>): Promise<ApiResponse<Team>> {
    return this.request<ApiResponse<Team>>(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teamData),
    });
  }

  async deleteTeam(id: string): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/teams/${id}`, {
      method: 'DELETE',
    });
  }

  async getMyTeams(): Promise<ApiResponse<Team[]>> {
    return this.request<ApiResponse<Team[]>>('/teams/my/teams');
  }

  async getTeamStats(id: string): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request<ApiResponse<Record<string, unknown>>>(`/teams/${id}/stats`);
  }

  // Challenge methods
  async createChallenge(challengeData: CreateChallengeRequest): Promise<ApiResponse<Challenge>> {
    return this.request<ApiResponse<Challenge>>('/challenges', {
      method: 'POST',
      body: JSON.stringify(challengeData),
    });
  }

  async getMyChallenges(): Promise<ApiResponse<Challenge[]>> {
    return this.request<ApiResponse<Challenge[]>>('/challenges/my');
  }

  async getPendingChallenges(): Promise<ApiResponse<Challenge[]>> {
    return this.request<ApiResponse<Challenge[]>>('/challenges/pending');
  }

  async respondToChallenge(
    challengeId: string,
    response: RespondToChallengeRequest
  ): Promise<ApiResponse<Challenge>> {
    return this.request<ApiResponse<Challenge>>(`/challenges/${challengeId}/respond`, {
      method: 'PATCH',
      body: JSON.stringify(response),
    });
  }

  // Match methods
  async createMatch(matchData: CreateMatchRequest): Promise<ApiResponse<Match>> {
    return this.request<ApiResponse<Match>>('/matches', {
      method: 'POST',
      body: JSON.stringify(matchData),
    });
  }

  async getTeamMatches(teamId: string, page = 1, limit = 10): Promise<PaginatedResponse<Match>> {
    return this.request<PaginatedResponse<Match>>(`/matches/team/${teamId}?page=${page}&limit=${limit}`);
  }

  async getMatchById(matchId: string): Promise<ApiResponse<Match>> {
    return this.request<ApiResponse<Match>>(`/matches/${matchId}`);
  }

  async getRecentMatches(filters?: MatchFilters): Promise<ApiResponse<Match[]>> {
    const queryParams = new URLSearchParams();
    if (filters?.sport) queryParams.append('sport', filters.sport);
    if (filters?.region) queryParams.append('region', filters.region);
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());

    return this.request<ApiResponse<Match[]>>(`/matches?${queryParams}`);
  }

  // Notification methods
  async getNotifications(filters?: NotificationFilters): Promise<ApiResponse<{
    notifications: Notification[];
    unreadCount: number;
    pagination?: Record<string, unknown>;
  }>> {
    const queryParams = new URLSearchParams();
    if (filters?.unreadOnly) queryParams.append('unreadOnly', 'true');
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());

    return this.request<ApiResponse<{
      notifications: Notification[];
      unreadCount: number;
      pagination?: Record<string, unknown>;
    }>>(`/notifications?${queryParams}`);
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<Notification>> {
    return this.request<ApiResponse<Notification>>(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>('/notifications/mark-all-read', {
      method: 'PATCH',
    });
  }

  async deleteNotification(notificationId: string): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  // Profile methods
  async getMyProfile(): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/profile/me');
  }

  async getPublicProfile(userId: string): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>(`/profile/${userId}`);
  }

  async updateBasicInfo(data: UpdateBasicInfoRequest): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/profile/basic-info', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateSocialLinks(data: UpdateSocialLinksRequest): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/profile/social-links', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateSportsPreferences(data: UpdateSportsPreferencesRequest): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/profile/sports-preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateAvailability(data: UpdateAvailabilityRequest): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/profile/availability', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateMedia(data: UpdateMediaRequest): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/profile/media', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updatePrivacySettings(data: UpdatePrivacySettingsRequest): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/profile/privacy-settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async generateQRCode(): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/profile/generate-qr', {
      method: 'POST',
    });
  }

  async addAchievement(data: AddAchievementRequest): Promise<ApiResponse<Achievement>> {
    return this.request<ApiResponse<Achievement>>('/profile/achievements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addTrophy(data: AddTrophyRequest): Promise<ApiResponse<Trophy>> {
    return this.request<ApiResponse<Trophy>>('/profile/trophies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Initialize token on client side
if (typeof window !== 'undefined') {
  apiClient.refreshToken();
}

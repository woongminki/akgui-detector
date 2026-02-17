import axios, { AxiosError } from 'axios';
import type { ApiResponse } from '@evil-spirit/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config;

    // If 401 and not refresh endpoint, try to refresh token
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const response = await api.post<ApiResponse<{ tokens: { accessToken: string; refreshToken: string } }>>(
            '/auth/refresh',
            { refreshToken }
          );

          if (response.data.success && response.data.data) {
            const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        } catch {
          // Refresh failed, clear tokens
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  kakaoLogin: (code: string) =>
    api.post<ApiResponse<{ user: { id: string; nickname: string; role: string }; tokens: { accessToken: string; refreshToken: string }; isNewUser: boolean }>>(
      '/auth/kakao',
      { code }
    ),
  googleLogin: (code: string) =>
    api.post<ApiResponse<{ user: { id: string; nickname: string; role: string }; tokens: { accessToken: string; refreshToken: string }; isNewUser: boolean }>>(
      '/auth/google',
      { code }
    ),
  refresh: (refreshToken: string) =>
    api.post<ApiResponse<{ tokens: { accessToken: string; refreshToken: string } }>>(
      '/auth/refresh',
      { refreshToken }
    ),
};

// User API
export const userApi = {
  getMe: () =>
    api.get<ApiResponse<{ id: string; nickname: string; role: string; createdAt: string }>>('/users/me'),
  updateNickname: (nickname: string) =>
    api.patch<ApiResponse<{ nickname: string; nicknameChangedAt: string }>>('/users/me/nickname', { nickname }),
  checkNickname: (nickname: string) =>
    api.get<ApiResponse<{ available: boolean; reason: string | null }>>(`/users/nickname/check?nickname=${nickname}`),
};

// Group API
export const groupApi = {
  create: (label: string) =>
    api.post<ApiResponse<{ id: string; label: string; inviteToken: string }>>('/groups', { label }),
  getMyGroups: () =>
    api.get<ApiResponse<{ id: string; label: string; memberCount: number; postCount: number }[]>>('/groups'),
  getGroup: (id: string) =>
    api.get<ApiResponse<{ id: string; label: string; memberCount: number; postCount: number; isCreator: boolean; inviteToken?: string }>>(`/groups/${id}`),
  join: (inviteToken: string) =>
    api.post<ApiResponse<{ id: string; label: string; alreadyMember: boolean; memberCount?: number; postCount?: number }>>('/groups/join', { inviteToken }),
  verifyInvite: (token: string) =>
    api.get<ApiResponse<{ valid: boolean; groupLabel: string; memberCount: number; isExpired: boolean }>>(`/groups/invite/${token}`),
  refreshInvite: (id: string) =>
    api.post<ApiResponse<{ inviteToken: string; inviteTokenExpiresAt: string }>>(`/groups/${id}/invite/refresh`),
  getDashboard: (id: string, period: '7d' | '30d' | 'all') =>
    api.get<ApiResponse<any>>(`/groups/${id}/dashboard?period=${period}`),
  getPosts: (id: string, params: { page: number; limit: number; tags?: string; scoreMin?: number; scoreMax?: number }) =>
    api.get<ApiResponse<any[]>>(`/groups/${id}/posts`, { params }),
};

// Post API
export const postApi = {
  create: (data: { groupId: string; content: string; tags: string[]; emotionTag: string; idempotencyKey: string }) =>
    api.post<ApiResponse<any>>('/posts', data),
  get: (id: string) =>
    api.get<ApiResponse<any>>(`/posts/${id}`),
  delete: (id: string) =>
    api.delete<ApiResponse<{ deleted: boolean }>>(`/posts/${id}`),
  addBookmark: (id: string) =>
    api.post<ApiResponse<{ bookmarked: boolean }>>(`/posts/${id}/bookmark`),
  removeBookmark: (id: string) =>
    api.delete<ApiResponse<{ bookmarked: boolean }>>(`/posts/${id}/bookmark`),
  getTrending: (limit: number = 4) =>
    api.get<ApiResponse<{ rank: number; keyword: string; count: number; trend: 'up' | 'down' | 'same' }[]>>(`/posts/trending?limit=${limit}`),
};

// Reaction API
export const reactionApi = {
  add: (postId: string, type: string) =>
    api.post<ApiResponse<{ reactionCounts: Record<string, number> }>>(`/posts/${postId}/reactions`, { type }),
  remove: (postId: string, type: string) =>
    api.delete<ApiResponse<{ removed: boolean }>>(`/posts/${postId}/reactions/${type}`),
};

// Comment API
export const commentApi = {
  getAll: (postId: string, page: number, limit: number) =>
    api.get<ApiResponse<any[]>>(`/posts/${postId}/comments`, { params: { page, limit } }),
  create: (postId: string, content: string, isPredefined: boolean) =>
    api.post<ApiResponse<any>>(`/posts/${postId}/comments`, { content, isPredefined }),
  delete: (postId: string, commentId: string) =>
    api.delete<ApiResponse<{ deleted: boolean }>>(`/posts/${postId}/comments/${commentId}`),
};

// Report API
export const reportApi = {
  create: (data: { targetType: 'post' | 'comment'; targetId: string; reason: string; description?: string }) =>
    api.post<ApiResponse<any>>('/reports', data),
};

// Block API
export const blockApi = {
  create: (blockedId: string) =>
    api.post<ApiResponse<any>>('/blocks', { blockedId }),
  remove: (blockedId: string) =>
    api.delete<ApiResponse<{ removed: boolean }>>(`/blocks/${blockedId}`),
  getAll: () =>
    api.get<ApiResponse<any[]>>('/blocks'),
};

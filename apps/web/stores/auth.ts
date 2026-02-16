import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { userApi } from '@/lib/api';

interface User {
  id: string;
  nickname: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      setTokens: (accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ accessToken, refreshToken, isAuthenticated: true });
      },

      setUser: (user) => {
        set({ user });
      },

      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      fetchUser: async () => {
        try {
          const response = await userApi.getMe();
          if (response.data.success && response.data.data) {
            set({ user: response.data.data as User });
          }
        } catch (error) {
          console.error('Failed to fetch user:', error);
          get().logout();
        }
      },

      initialize: async () => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (accessToken && refreshToken) {
          set({ accessToken, refreshToken, isAuthenticated: true });
          await get().fetchUser();
        }

        set({ isLoading: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);

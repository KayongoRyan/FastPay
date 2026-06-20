import { create } from 'zustand';

import {
  clearAuthSession,
  fetchCurrentUser,
  isAccessTokenExpired,
  loadAccessToken,
  loadRefreshToken,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
  saveAuthSession,
  type AuthUser,
  type LoginInput,
  type RegisterInput,
} from '@/lib/auth';
import { setAccessTokenProvider } from '@/lib/api/client';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshIfNeeded: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  setAccessTokenProvider(async () => get().accessToken);

  return {
    user: null,
    accessToken: null,
    isReady: false,
    isLoading: false,
    error: null,

    initialize: async () => {
      set({ isLoading: true, error: null });

      try {
        const [accessToken, refreshToken] = await Promise.all([
          loadAccessToken(),
          loadRefreshToken(),
        ]);

        if (!accessToken || !refreshToken) {
          set({ isReady: true, isLoading: false, user: null, accessToken: null });
          return;
        }

        if (isAccessTokenExpired(accessToken)) {
          const refreshed = await refreshSession(refreshToken);
          set({ accessToken: refreshed.accessToken });
          const user = await fetchCurrentUser();
          await saveAuthSession(user, refreshed);
          set({
            user,
            accessToken: refreshed.accessToken,
            isReady: true,
            isLoading: false,
          });
          return;
        }

        set({ accessToken });
        const user = await fetchCurrentUser();
        await saveAuthSession(user, {
          accessToken,
          refreshToken,
          expiresIn: '15m',
        });

        set({
          user,
          accessToken,
          isReady: true,
          isLoading: false,
        });
      } catch {
        await clearAuthSession();
        set({
          user: null,
          accessToken: null,
          isReady: true,
          isLoading: false,
        });
      }
    },

    register: async (input) => {
      set({ isLoading: true, error: null });

      try {
        const session = await registerUser(input);
        await saveAuthSession(session.user, session.tokens);
        set({
          user: session.user,
          accessToken: session.tokens.accessToken,
          isLoading: false,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Registration failed';
        set({ isLoading: false, error: message });
        throw error;
      }
    },

    login: async (input) => {
      set({ isLoading: true, error: null });

      try {
        const session = await loginUser(input);
        await saveAuthSession(session.user, session.tokens);
        set({
          user: session.user,
          accessToken: session.tokens.accessToken,
          isLoading: false,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed';
        set({ isLoading: false, error: message });
        throw error;
      }
    },

    logout: async () => {
      set({ isLoading: true, error: null });

      try {
        if (get().accessToken) {
          await logoutUser();
        }
      } catch {
        // Clear local session even if server logout fails
      } finally {
        await clearAuthSession();
        set({
          user: null,
          accessToken: null,
          isLoading: false,
        });
      }
    },

    refreshIfNeeded: async () => {
      const { accessToken } = get();
      const refreshToken = await loadRefreshToken();

      if (!accessToken || !refreshToken || !isAccessTokenExpired(accessToken)) {
        return false;
      }

      const tokens = await refreshSession(refreshToken);
      const user = get().user;

      if (user) {
        await saveAuthSession(user, tokens);
      }

      set({ accessToken: tokens.accessToken });
      return true;
    },
  };
});

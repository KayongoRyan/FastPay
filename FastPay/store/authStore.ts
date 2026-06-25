import { create } from 'zustand';

import {
  biometricLogin,
  clearAuthSession,
  clearDeviceKeyMaterial,
  enrollBiometric,
  fetchBiometricChallenge,
  fetchCurrentUser,
  generateDeviceKeyMaterial,
  getBiometricCapability,
  isAccessTokenExpired,
  isBiometricLockEnabled,
  loadAccessToken,
  loadDeviceKeyMaterial,
  loadRefreshToken,
  loadStoredUser,
  loginUser,
  logoutUser,
  promptBiometric,
  refreshSession,
  registerUser,
  saveAuthSession,
  saveDeviceKeyMaterial,
  setBiometricLockEnabled,
  resetLocalBiometricState,
  signChallenge,
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
  isLocked: boolean;
  biometricLabel: string;
  error: string | null;
  initialize: () => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshIfNeeded: () => Promise<boolean>;
  unlockWithBiometric: () => Promise<void>;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  setAccessTokenProvider(async () => get().accessToken);

  return {
    user: null,
    accessToken: null,
    isReady: false,
    isLoading: false,
    isLocked: false,
    biometricLabel: 'Biometrics',
    error: null,

    initialize: async () => {
      set({ isLoading: true, error: null });

      try {
        const capability = await getBiometricCapability();
        set({ biometricLabel: capability.label });

        const [storedUser, biometricLock] = await Promise.all([
          loadStoredUser(),
          isBiometricLockEnabled(),
        ]);

        if (biometricLock && storedUser?.biometricEnabled) {
          const deviceKey = await loadDeviceKeyMaterial();
          if (deviceKey) {
            set({
              user: storedUser,
              accessToken: null,
              isLocked: true,
              isReady: true,
              isLoading: false,
            });
            return;
          }

          await setBiometricLockEnabled(false);
        }

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
          await saveAuthSession(user, refreshed, {
            biometricProtected: storedUser?.biometricEnabled ?? false,
          });
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
        }, {
          biometricProtected: user.biometricEnabled,
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
          isLocked: false,
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
          isLocked: false,
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
        await setBiometricLockEnabled(false);
        set({
          user: session.user,
          accessToken: session.tokens.accessToken,
          isLocked: false,
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
          isLocked: false,
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
        await saveAuthSession(user, tokens, {
          biometricProtected: user.biometricEnabled,
        });
      }

      set({ accessToken: tokens.accessToken });
      return true;
    },

    unlockWithBiometric: async () => {
      set({ isLoading: true, error: null });

      try {
        const authenticated = await promptBiometric('Unlock FastPay');
        if (!authenticated) {
          set({ isLoading: false, error: 'Biometric authentication cancelled' });
          return;
        }

        const deviceKey = await loadDeviceKeyMaterial();
        if (!deviceKey) {
          throw new Error('Biometric device key not found');
        }

        const { challenge } = await fetchBiometricChallenge(deviceKey.deviceId);
        const signature = signChallenge(deviceKey.secretKey, challenge);
        const session = await biometricLogin({
          deviceId: deviceKey.deviceId,
          signature,
        });

        await saveAuthSession(session.user, session.tokens, {
          biometricProtected: true,
        });

        set({
          user: session.user,
          accessToken: session.tokens.accessToken,
          isLocked: false,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Biometric unlock failed';

        if (message.toLowerCase().includes('not enrolled')) {
          const updatedUser = await resetLocalBiometricState(get().user);
          set({
            user: updatedUser,
            isLocked: false,
            isLoading: false,
            error:
              'Biometric setup is out of sync. Sign in with your password and re-enable biometrics in Settings.',
          });
          return;
        }

        set({ isLoading: false, error: message });
        throw error;
      }
    },

    enableBiometric: async () => {
      const { user, accessToken, isLoading } = get();
      if (isLoading) {
        return;
      }
      if (!user || !accessToken) {
        throw new Error('Sign in before enabling biometrics');
      }

      set({ isLoading: true, error: null });

      let enrolledOnBackend = false;

      try {
        const capability = await getBiometricCapability();
        if (!capability.available || !capability.enrolled) {
          throw new Error(`${capability.label} is not available on this device`);
        }

        const authenticated = await promptBiometric(`Enable ${capability.label}`);
        if (!authenticated) {
          set({ isLoading: false, error: 'Biometric authentication cancelled' });
          return;
        }

        await clearDeviceKeyMaterial();

        const deviceKey = await generateDeviceKeyMaterial();
        await saveDeviceKeyMaterial(deviceKey.deviceId, deviceKey.secretKey);

        const updatedUser = await enrollBiometric({
          enabled: true,
          deviceId: deviceKey.deviceId,
          publicKey: deviceKey.publicKey,
        });
        enrolledOnBackend = true;

        const refreshToken = await loadRefreshToken();
        if (!refreshToken) {
          throw new Error('Missing refresh token');
        }

        await saveAuthSession(updatedUser, {
          accessToken,
          refreshToken,
          expiresIn: '15m',
        }, { biometricProtected: true });

        await setBiometricLockEnabled(true);

        set({
          user: updatedUser,
          biometricLabel: capability.label,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        await clearDeviceKeyMaterial();
        await setBiometricLockEnabled(false);

        if (enrolledOnBackend) {
          try {
            await enrollBiometric({ enabled: false });
          } catch {
            // Best-effort rollback if later steps failed after enroll.
          }
        }

        const message =
          error instanceof Error ? error.message : 'Failed to enable biometrics';
        set({ isLoading: false, error: message });
        throw error;
      }
    },

    disableBiometric: async () => {
      const { user, accessToken } = get();
      if (!user || !accessToken) {
        return;
      }

      set({ isLoading: true, error: null });

      try {
        const updatedUser = await enrollBiometric({ enabled: false });
        const refreshToken = await loadRefreshToken();
        if (!refreshToken) {
          throw new Error('Missing refresh token');
        }

        await saveAuthSession(updatedUser, {
          accessToken,
          refreshToken,
          expiresIn: '15m',
        });

        await clearDeviceKeyMaterial();
        await setBiometricLockEnabled(false);

        set({
          user: updatedUser,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to disable biometrics';
        set({ isLoading: false, error: message });
        throw error;
      }
    },
  };
});

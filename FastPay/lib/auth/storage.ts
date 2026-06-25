import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { AuthTokens, AuthUser } from './types';
import { DEVICE_ID_KEY, DEVICE_SECRET_KEY } from './device-key';

const ACCESS_TOKEN_KEY = 'fastpay_access_token';
const REFRESH_TOKEN_KEY = 'fastpay_refresh_token';
const REFRESH_TOKEN_BIO_KEY = 'fastpay_refresh_token_bio';
const USER_KEY = 'fastpay_auth_user';
const BIOMETRIC_LOCK_KEY = 'fastpay_biometric_lock';

type SecureOptions = SecureStore.SecureStoreOptions | undefined;

async function setSecureItem(
  key: string,
  value: string,
  options?: SecureOptions,
): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value, options);
}

async function getSecureItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(key);
  }

  return SecureStore.getItemAsync(key);
}

async function deleteSecureItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

export async function saveAuthSession(
  user: AuthUser,
  tokens: AuthTokens,
  options?: { biometricProtected?: boolean },
): Promise<void> {
  const biometricProtected = options?.biometricProtected ?? false;

  await setSecureItem(ACCESS_TOKEN_KEY, tokens.accessToken);

  if (biometricProtected) {
    await setSecureItem(REFRESH_TOKEN_BIO_KEY, tokens.refreshToken);
    await deleteSecureItem(REFRESH_TOKEN_KEY);
  } else {
    await setSecureItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    await deleteSecureItem(REFRESH_TOKEN_BIO_KEY);
  }

  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function loadAccessToken(): Promise<string | null> {
  return getSecureItem(ACCESS_TOKEN_KEY);
}

export async function loadRefreshToken(): Promise<string | null> {
  const standard = await getSecureItem(REFRESH_TOKEN_KEY);
  if (standard) {
    return standard;
  }

  return getSecureItem(REFRESH_TOKEN_BIO_KEY);
}

export async function loadStoredUser(): Promise<AuthUser | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export async function clearAuthSession(): Promise<void> {
  await Promise.all([
    deleteSecureItem(ACCESS_TOKEN_KEY),
    deleteSecureItem(REFRESH_TOKEN_KEY),
    deleteSecureItem(REFRESH_TOKEN_BIO_KEY),
    deleteSecureItem(DEVICE_ID_KEY),
    deleteSecureItem(DEVICE_SECRET_KEY),
    AsyncStorage.multiRemove([USER_KEY, BIOMETRIC_LOCK_KEY]),
  ]);
}

export async function setBiometricLockEnabled(enabled: boolean): Promise<void> {
  if (enabled) {
    await AsyncStorage.setItem(BIOMETRIC_LOCK_KEY, '1');
    return;
  }

  await AsyncStorage.removeItem(BIOMETRIC_LOCK_KEY);
}

export async function isBiometricLockEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(BIOMETRIC_LOCK_KEY);
  return value === '1';
}

export async function saveDeviceKeyMaterial(
  deviceId: string,
  secretKey: string,
): Promise<void> {
  // Writes are sequential; biometric is verified via promptBiometric before use.
  await setSecureItem(DEVICE_ID_KEY, deviceId);
  await setSecureItem(DEVICE_SECRET_KEY, secretKey);
}

export async function loadDeviceKeyMaterial(): Promise<{
  deviceId: string;
  secretKey: string;
} | null> {
  const [deviceId, secretKey] = await Promise.all([
    getSecureItem(DEVICE_ID_KEY),
    getSecureItem(DEVICE_SECRET_KEY),
  ]);

  if (!deviceId || !secretKey) {
    return null;
  }

  return { deviceId, secretKey };
}

export async function clearDeviceKeyMaterial(): Promise<void> {
  await Promise.all([
    deleteSecureItem(DEVICE_ID_KEY),
    deleteSecureItem(DEVICE_SECRET_KEY),
  ]);
}

export async function resetLocalBiometricState(
  user: AuthUser | null,
): Promise<AuthUser | null> {
  await clearDeviceKeyMaterial();
  await setBiometricLockEnabled(false);

  if (!user) {
    return null;
  }

  const updatedUser = { ...user, biometricEnabled: false };
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  return updatedUser;
}

export function getAccessTokenExpiryMs(accessToken: string): number | null {
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1] ?? '')) as {
      exp?: number;
    };
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isAccessTokenExpired(
  accessToken: string,
  skewMs = 30_000,
): boolean {
  const expiry = getAccessTokenExpiryMs(accessToken);
  if (!expiry) {
    return true;
  }

  return Date.now() >= expiry - skewMs;
}

import { apiGet, apiGetAuth, apiPost, apiPostAuth } from '@/lib/api/client';

import type {
  AuthSession,
  AuthTokens,
  AuthUser,
  BiometricEnrollInput,
  LoginInput,
  RegisterInput,
} from './types';

export async function registerUser(input: RegisterInput): Promise<AuthSession> {
  return apiPost<AuthSession>('/auth/register', input);
}

export async function loginUser(input: LoginInput): Promise<AuthSession> {
  return apiPost<AuthSession>('/auth/login', input);
}

export async function refreshSession(refreshToken: string): Promise<AuthTokens> {
  return apiPost<AuthTokens>('/auth/refresh', { refreshToken });
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  return apiGetAuth<AuthUser>('/auth/me');
}

export async function logoutUser(): Promise<void> {
  await apiPostAuth<{ success: true }>('/auth/logout', {});
}

export async function enrollBiometric(
  input: BiometricEnrollInput,
): Promise<AuthUser> {
  return apiPostAuth<AuthUser>('/auth/biometric/enroll', input);
}

export async function fetchBiometricChallenge(
  deviceId: string,
): Promise<{ challenge: string; expiresIn: number }> {
  return apiGet<{ challenge: string; expiresIn: number }>(
    `/auth/biometric/challenge?deviceId=${encodeURIComponent(deviceId)}`,
  );
}

export async function biometricLogin(input: {
  deviceId: string;
  signature: string;
}): Promise<AuthSession> {
  return apiPost<AuthSession>('/auth/biometric/login', input);
}

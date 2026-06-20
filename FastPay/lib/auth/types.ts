export interface AuthUser {
  id: string;
  fullName: string;
  phone?: string;
  email?: string;
  kycLevel: number;
  kycStatus: string;
  biometricEnabled: boolean;
  isActive: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthSession {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface RegisterInput {
  fullName: string;
  password: string;
  email?: string;
  phone?: string;
}

export interface LoginInput {
  identifier: string;
  password: string;
}

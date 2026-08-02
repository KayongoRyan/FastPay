export interface AuthUser {
  id: string;
  fullName: string;
  phone?: string;
  email?: string;
  kycLevel: number;
  kycStatus: string;
  biometricEnabled: boolean;
  isActive: boolean;
  accountType?: "consumer" | "merchant" | "business";
  merchantOrgId?: string;
  merchantCode?: string;
  businessName?: string;
  businessOrgId?: string;
  businessCode?: string;
  companyName?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  sessionId?: string;
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

export interface BiometricEnrollInput {
  enabled: boolean;
  deviceId?: string;
  publicKey?: string;
}

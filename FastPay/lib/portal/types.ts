export type AccountType = "consumer" | "merchant" | "business";

export interface PortalUser {
  id: string;
  fullName: string;
  phone?: string;
  email?: string;
  accountType: AccountType;
  merchantOrgId?: string;
  merchantCode?: string;
  businessName?: string;
  businessOrgId?: string;
  businessCode?: string;
  companyName?: string;
  kycLevel?: number;
  kycStatus?: string;
  biometricEnabled?: boolean;
  isActive?: boolean;
}

export interface PortalTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: string;
  sessionId?: string;
}

export interface PortalSession {
  user: PortalUser;
  tokens: PortalTokens;
}

export type PortalKind = "merchant" | "business";

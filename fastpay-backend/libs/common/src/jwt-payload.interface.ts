export type AccountType = 'consumer' | 'merchant' | 'business';

export interface JwtAccessPayload {
  sub: string;
  type: 'access';
  accountType?: AccountType;
  merchantOrgId?: string;
  businessOrgId?: string;
}

export interface AuthenticatedRequestUser {
  userId: string;
  accountType?: AccountType;
  merchantOrgId?: string;
  businessOrgId?: string;
}

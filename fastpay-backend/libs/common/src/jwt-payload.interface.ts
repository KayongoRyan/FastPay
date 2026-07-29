export type AccountType = 'consumer' | 'merchant';

export interface JwtAccessPayload {
  sub: string;
  type: 'access';
  accountType?: AccountType;
  merchantOrgId?: string;
}

export interface AuthenticatedRequestUser {
  userId: string;
  accountType?: AccountType;
  merchantOrgId?: string;
}

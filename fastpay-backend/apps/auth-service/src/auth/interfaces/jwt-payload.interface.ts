import { AccountType } from '@fastpay/schemas';

export interface JwtAccessPayload {
  sub: string;
  type: 'access';
  accountType?: AccountType;
  merchantOrgId?: string;
}

export interface JwtRefreshPayload {
  sub: string;
  type: 'refresh';
  jti: string;
}

export interface AuthenticatedUser {
  userId: string;
  accountType?: AccountType;
  merchantOrgId?: string;
}

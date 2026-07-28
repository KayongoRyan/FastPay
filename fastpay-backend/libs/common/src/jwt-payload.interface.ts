export interface JwtAccessPayload {
  sub: string;
  type: 'access';
}

export interface AuthenticatedRequestUser {
  userId: string;
}

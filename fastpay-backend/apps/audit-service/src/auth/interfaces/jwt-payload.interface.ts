export interface JwtAccessPayload {
  sub: string;
  type: 'access';
}

export interface AuthenticatedUser {
  userId: string;
}

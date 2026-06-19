import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtAccessSecret:
    process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret-change-in-production',
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-change-in-production',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 12),
}));

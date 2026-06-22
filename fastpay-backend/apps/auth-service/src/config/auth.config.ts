import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtAccessSecret:
    process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret-change-in-production',
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-change-in-production',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 12),
  redisHost: process.env.REDIS_HOST ?? 'localhost',
  redisPort: Number(process.env.REDIS_PORT ?? 6380),
  loginMaxAttempts: Number(process.env.AUTH_LOGIN_MAX_ATTEMPTS ?? 5),
  loginWindowSeconds: Number(process.env.AUTH_LOGIN_WINDOW_SECONDS ?? 900),
  loginLockoutSeconds: Number(process.env.AUTH_LOGIN_LOCKOUT_SECONDS ?? 900),
  registerMaxPerIp: Number(process.env.AUTH_REGISTER_MAX_PER_IP ?? 10),
  registerWindowSeconds: Number(process.env.AUTH_REGISTER_WINDOW_SECONDS ?? 3600),
  biometricChallengeTtlSeconds: Number(
    process.env.AUTH_BIOMETRIC_CHALLENGE_TTL_SECONDS ?? 60,
  ),
}));

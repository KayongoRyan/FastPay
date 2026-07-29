import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? 'change-me-access',
  internalServiceSecret:
    process.env.INTERNAL_SERVICE_SECRET ?? 'dev-internal-secret-change-in-production',
}));

import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtAccessSecret:
    process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret-change-in-production',
  internalServiceSecret:
    process.env.INTERNAL_SERVICE_SECRET ?? 'dev-internal-secret-change-in-production',
}));

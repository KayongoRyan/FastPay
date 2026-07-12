import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtAccessSecret:
    process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret-change-in-production',
  redisHost: process.env.REDIS_HOST ?? 'localhost',
  redisPort: Number(process.env.REDIS_PORT ?? 6380),
}));

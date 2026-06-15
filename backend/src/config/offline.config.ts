import { registerAs } from '@nestjs/config';

export default registerAs('offline', () => ({
  queueName: process.env.OFFLINE_QUEUE_NAME ?? 'offline-tx',
  estimatedSeconds: Number(process.env.OFFLINE_ESTIMATED_SECONDS ?? 120),
  retryAttempts: Number(process.env.OFFLINE_RETRY_ATTEMPTS ?? 5),
  retryBackoffMs: Number(process.env.OFFLINE_RETRY_BACKOFF_MS ?? 5000),
  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/FastPay',
  redisHost: process.env.REDIS_HOST ?? 'localhost',
  redisPort: Number(process.env.REDIS_PORT ?? 6379),
}));

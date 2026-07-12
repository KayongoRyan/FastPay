import { connect } from 'node:net';

import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';

function isPortOpen(port: number, host = '127.0.0.1'): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = connect({ port, host });
    const done = (open: boolean) => {
      socket.destroy();
      resolve(open);
    };

    socket.setTimeout(1500);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
  });
}

export async function createAssistantRedisClient(
  configService: ConfigService,
): Promise<Redis> {
  const host = configService.getOrThrow<string>('auth.redisHost');
  const port = configService.getOrThrow<number>('auth.redisPort');
  const forceMock = process.env.FASTPAY_MEMORY_REDIS === 'true';

  if (!forceMock && (await isPortOpen(port))) {
    const redis = new Redis({
      host,
      port,
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });
    await redis.connect();
    return redis;
  }

  console.warn(
    `[assistant-service] Redis not reachable on ${host}:${port}. Using in-memory Redis for rate limiting.`,
  );

  return new RedisMock() as unknown as Redis;
}

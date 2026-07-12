import { HttpException, HttpStatus, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type Redis from 'ioredis';

import { createAssistantRedisClient } from '../common/create-redis-client';

@Injectable()
export class RateLimiterService implements OnModuleInit, OnModuleDestroy {
  private redis: Redis | null = null;
  private readonly memoryCounts = new Map<string, { count: number; resetAt: number }>();

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.redis = await createAssistantRedisClient(this.configService);
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
    }
  }

  async checkLimit(userId: string): Promise<void> {
    const limit = this.configService.getOrThrow<number>('assistant.rateLimitPerHour');
    const key = `assistant:rate:${userId}`;
    const windowMs = 60 * 60 * 1000;

    if (this.redis) {
      try {
        const count = await this.redis.incr(key);
        if (count === 1) {
          await this.redis.pexpire(key, windowMs);
        }
        if (count > limit) {
          throw new HttpException(
            `Assistant rate limit exceeded (${limit} requests per hour)`,
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }
        return;
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }
      }
    }

    const now = Date.now();
    const entry = this.memoryCounts.get(key);
    if (!entry || entry.resetAt <= now) {
      this.memoryCounts.set(key, { count: 1, resetAt: now + windowMs });
      return;
    }

    entry.count += 1;
    if (entry.count > limit) {
      throw new HttpException(
        `Assistant rate limit exceeded (${limit} requests per hour)`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}

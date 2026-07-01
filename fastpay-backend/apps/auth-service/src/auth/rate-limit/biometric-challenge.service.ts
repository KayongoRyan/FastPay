import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import Redis from 'ioredis';

import { createAuthRedisClient } from '../../create-redis-client';

interface StoredChallenge {
  userId: string;
  nonce: string;
}

@Injectable()
export class BiometricChallengeService implements OnModuleInit, OnModuleDestroy {
  private redis!: Redis;
  private readonly ttlSeconds: number;

  constructor(private readonly configService: ConfigService) {
    this.ttlSeconds = this.configService.get<number>(
      'auth.biometricChallengeTtlSeconds',
      60,
    );
  }

  async onModuleInit(): Promise<void> {
    this.redis = await createAuthRedisClient(this.configService);
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }

  async createChallenge(userId: string, deviceId: string): Promise<string> {
    const nonce = randomUUID();
    const payload: StoredChallenge = { userId, nonce };

    await this.redis.setex(
      this.challengeKey(deviceId),
      this.ttlSeconds,
      JSON.stringify(payload),
    );

    return nonce;
  }

  async consumeChallenge(
    deviceId: string,
  ): Promise<StoredChallenge | null> {
    const key = this.challengeKey(deviceId);
    const raw = await this.redis.get(key);

    if (!raw) {
      return null;
    }

    await this.redis.del(key);

    try {
      return JSON.parse(raw) as StoredChallenge;
    } catch {
      return null;
    }
  }

  get expiresInSeconds(): number {
    return this.ttlSeconds;
  }

  private challengeKey(deviceId: string): string {
    return `auth:biometric:challenge:${deviceId}`;
  }
}

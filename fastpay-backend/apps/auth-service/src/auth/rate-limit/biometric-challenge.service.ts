import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import Redis from 'ioredis';

interface StoredChallenge {
  userId: string;
  nonce: string;
}

@Injectable()
export class BiometricChallengeService implements OnModuleInit, OnModuleDestroy {
  private readonly redis: Redis;
  private readonly ttlSeconds: number;

  constructor(private readonly configService: ConfigService) {
    this.ttlSeconds = this.configService.get<number>(
      'auth.biometricChallengeTtlSeconds',
      60,
    );

    this.redis = new Redis({
      host: this.configService.getOrThrow<string>('auth.redisHost'),
      port: this.configService.getOrThrow<number>('auth.redisPort'),
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.redis.connect();
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

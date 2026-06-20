import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export interface RateLimitFailureResult {
  locked: boolean;
  attemptsRemaining: number;
}

@Injectable()
export class LoginRateLimiterService implements OnModuleInit, OnModuleDestroy {
  private readonly redis: Redis;
  private readonly maxAttempts: number;
  private readonly windowSeconds: number;
  private readonly lockoutSeconds: number;
  private readonly registerMaxPerIp: number;
  private readonly registerWindowSeconds: number;

  constructor(private readonly configService: ConfigService) {
    this.maxAttempts = this.configService.getOrThrow<number>(
      'auth.loginMaxAttempts',
    );
    this.windowSeconds = this.configService.getOrThrow<number>(
      'auth.loginWindowSeconds',
    );
    this.lockoutSeconds = this.configService.getOrThrow<number>(
      'auth.loginLockoutSeconds',
    );
    this.registerMaxPerIp = this.configService.getOrThrow<number>(
      'auth.registerMaxPerIp',
    );
    this.registerWindowSeconds = this.configService.getOrThrow<number>(
      'auth.registerWindowSeconds',
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

  async assertLoginAllowed(identifier: string): Promise<void> {
    const lockKey = this.loginLockKey(identifier);
    const ttl = await this.redis.ttl(lockKey);

    if (ttl > 0) {
      throw new HttpException(
        {
          message: 'Account temporarily locked due to too many failed login attempts',
          retryAfterSeconds: ttl,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async recordLoginFailure(identifier: string): Promise<RateLimitFailureResult> {
    const failKey = this.loginFailKey(identifier);
    const lockKey = this.loginLockKey(identifier);

    const attempts = await this.redis.incr(failKey);
    if (attempts === 1) {
      await this.redis.expire(failKey, this.windowSeconds);
    }

    if (attempts >= this.maxAttempts) {
      await this.redis.setex(lockKey, this.lockoutSeconds, '1');
      await this.redis.del(failKey);

      return {
        locked: true,
        attemptsRemaining: 0,
      };
    }

    return {
      locked: false,
      attemptsRemaining: Math.max(0, this.maxAttempts - attempts),
    };
  }

  async clearLoginFailures(identifier: string): Promise<void> {
    await this.redis.del(this.loginFailKey(identifier), this.loginLockKey(identifier));
  }

  async assertRegisterAllowed(ipAddress?: string): Promise<void> {
    if (!ipAddress) {
      return;
    }

    const key = this.registerIpKey(ipAddress);
    const count = await this.redis.incr(key);

    if (count === 1) {
      await this.redis.expire(key, this.registerWindowSeconds);
    }

    if (count > this.registerMaxPerIp) {
      const ttl = await this.redis.ttl(key);
      throw new HttpException(
        {
          message: 'Too many registration attempts from this IP',
          retryAfterSeconds: ttl > 0 ? ttl : this.registerWindowSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private loginFailKey(identifier: string): string {
    return `auth:login:fail:${this.normalizeIdentifier(identifier)}`;
  }

  private loginLockKey(identifier: string): string {
    return `auth:login:lock:${this.normalizeIdentifier(identifier)}`;
  }

  private registerIpKey(ipAddress: string): string {
    return `auth:register:ip:${ipAddress}`;
  }

  private normalizeIdentifier(identifier: string): string {
    return identifier.trim().toLowerCase();
  }
}

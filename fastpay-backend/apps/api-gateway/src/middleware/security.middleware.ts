import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import Redis from 'ioredis';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const requestId = (req.headers['x-request-id'] as string) ?? randomUUID();
    req.headers['x-request-id'] = requestId;
    res.setHeader('X-Request-Id', requestId);
    next();
  }
}

@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(_req: Request, res: Response, next: NextFunction): void {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; frame-ancestors 'none'",
    );
    if (process.env.NODE_ENV === 'production') {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains',
      );
    }
    next();
  }
}

interface RateBucket {
  count: number;
  resetAt: number;
}

interface RateRule {
  prefix: string;
  max: number;
  windowMs: number;
}

/**
 * Fixed-window rate limiter.
 *
 * Uses Redis (INCR + PEXPIRE) when available so limits are shared across
 * gateway replicas and survive restarts. Falls back to per-process in-memory
 * buckets when Redis is unreachable — fail-open, never block traffic because
 * the limiter store is down.
 */
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RateLimitMiddleware.name);
  private readonly buckets = new Map<string, RateBucket>();
  private readonly redis: Redis | null;
  private redisHealthy = false;

  private readonly rules: RateRule[] = [
    { prefix: '/auth/login', max: 20, windowMs: 15 * 60 * 1000 },
    { prefix: '/offline/relay', max: 30, windowMs: 60 * 1000 },
    { prefix: '/security', max: 120, windowMs: 60 * 1000 },
  ];

  constructor() {
    const host = process.env.REDIS_HOST;
    if (!host) {
      this.redis = null;
      return;
    }

    this.redis = new Redis({
      host,
      port: Number(process.env.REDIS_PORT ?? 6379),
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => Math.min(times * 500, 5000),
    });

    this.redis.on('ready', () => {
      this.redisHealthy = true;
      this.logger.log('Rate limiter using Redis store');
    });
    this.redis.on('error', () => {
      if (this.redisHealthy) {
        this.logger.warn('Redis unavailable — rate limiter falling back to memory');
      }
      this.redisHealthy = false;
    });

    this.redis.connect().catch(() => {
      this.redisHealthy = false;
    });
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const path = req.originalUrl.split('?')[0] ?? req.path;
    const rule = this.rules.find((r) => path.startsWith(r.prefix));
    if (!rule) {
      next();
      return;
    }

    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      req.ip ??
      'unknown';
    const key = `${rule.prefix}:${ip}`;

    if (this.redis && this.redisHealthy) {
      void this.checkRedis(key, rule, res, next);
      return;
    }

    this.checkMemory(key, rule, res, next);
  }

  private async checkRedis(
    key: string,
    rule: RateRule,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const redisKey = `rl:${key}`;
      const count = await this.redis!.incr(redisKey);
      if (count === 1) {
        await this.redis!.pexpire(redisKey, rule.windowMs);
      }

      if (count > rule.max) {
        res
          .status(429)
          .json({ message: 'Too many requests. Please try again later.' });
        return;
      }

      next();
    } catch {
      // Redis hiccup mid-request: fail open via the in-memory path.
      this.redisHealthy = false;
      this.checkMemory(key, rule, res, next);
    }
  }

  private checkMemory(
    key: string,
    rule: RateRule,
    res: Response,
    next: NextFunction,
  ): void {
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + rule.windowMs });
      next();
      return;
    }

    bucket.count += 1;
    if (bucket.count > rule.max) {
      res
        .status(429)
        .json({ message: 'Too many requests. Please try again later.' });
      return;
    }

    next();
  }
}

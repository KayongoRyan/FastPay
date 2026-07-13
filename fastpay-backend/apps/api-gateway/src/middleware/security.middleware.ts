import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

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

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly buckets = new Map<string, RateBucket>();

  private readonly rules: Array<{ prefix: string; max: number; windowMs: number }> = [
    { prefix: '/auth/login', max: 20, windowMs: 15 * 60 * 1000 },
    { prefix: '/offline/relay', max: 30, windowMs: 60 * 1000 },
    { prefix: '/security', max: 120, windowMs: 60 * 1000 },
  ];

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
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + rule.windowMs });
      next();
      return;
    }

    bucket.count += 1;
    if (bucket.count > rule.max) {
      res.status(429).json({ message: 'Too many requests. Please try again later.' });
      return;
    }

    next();
  }
}

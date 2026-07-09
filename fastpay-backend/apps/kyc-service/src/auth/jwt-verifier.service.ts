import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { JwtAccessPayload } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class JwtVerifierService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  verifyAccessToken(authorization?: string): string {
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const token = authorization.slice('Bearer '.length);
    let payload: JwtAccessPayload;

    try {
      payload = this.jwtService.verify<JwtAccessPayload>(token, {
        secret: this.configService.getOrThrow<string>('auth.jwtAccessSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }

    if (payload.type !== 'access' || !payload.sub) {
      throw new UnauthorizedException('Invalid access token');
    }

    return payload.sub;
  }
}

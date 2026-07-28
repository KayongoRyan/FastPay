import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InternalOrJwtGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      internalAuthorized?: boolean;
    }>();

    const secret = request.headers['x-internal-secret'];
    const expected = this.configService.get<string>('auth.internalServiceSecret') ??
      process.env.INTERNAL_SERVICE_SECRET ??
      'dev-internal-secret-change-in-production';

    if (secret && secret === expected) {
      request.internalAuthorized = true;
      return true;
    }

    const authorization = request.headers.authorization;
    if (authorization?.startsWith('Bearer ')) {
      return true;
    }

    throw new UnauthorizedException('Authentication required');
  }
}

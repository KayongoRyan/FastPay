import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { AuthenticatedRequestUser } from './jwt-payload.interface';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class BusinessAuthGuard extends JwtAuthGuard implements CanActivate {
  override canActivate(context: ExecutionContext): boolean {
    const allowed = super.canActivate(context);
    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedRequestUser }>();
    const user = request.user;

    if (!user || user.accountType !== 'business') {
      throw new ForbiddenException('Business account required');
    }

    return allowed;
  }
}

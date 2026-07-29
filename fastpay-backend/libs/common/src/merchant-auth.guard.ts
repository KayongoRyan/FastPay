import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { AuthenticatedRequestUser } from './jwt-payload.interface';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class MerchantAuthGuard extends JwtAuthGuard implements CanActivate {
  override canActivate(context: ExecutionContext): boolean {
    const allowed = super.canActivate(context);
    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedRequestUser }>();
    const user = request.user;

    if (!user || user.accountType !== 'merchant') {
      throw new ForbiddenException('Merchant account required');
    }

    return allowed;
  }
}

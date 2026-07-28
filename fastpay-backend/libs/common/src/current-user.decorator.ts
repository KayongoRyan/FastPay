import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AuthenticatedRequestUser } from './jwt-payload.interface';

export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthenticatedRequestUser }>();
    return request.user?.userId ?? '';
  },
);

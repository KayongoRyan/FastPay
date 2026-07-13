import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import {
  RateLimitMiddleware,
  RequestIdMiddleware,
  SecurityHeadersMiddleware,
} from './middleware/security.middleware';
import { ProxyModule } from './proxy/proxy.module';

@Module({
  imports: [ProxyModule],
})
export class GatewayMiddlewareModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware, SecurityHeadersMiddleware, RateLimitMiddleware)
      .forRoutes('*');
  }
}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { createHealthController } from '@fastpay/common';

import gatewayConfig from './config/gateway.config';
import { GatewayMiddlewareModule } from './gateway-middleware.module';

const HealthController = createHealthController('api-gateway');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [gatewayConfig],
      envFilePath: ['.env', '../../.env'],
    }),
    GatewayMiddlewareModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

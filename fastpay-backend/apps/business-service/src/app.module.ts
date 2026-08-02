import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { createHealthController } from '@fastpay/common';
import { FastpayMongoModule } from '@fastpay/mongo';

import authConfig from './config/auth.config';
import businessConfig from './config/business.config';
import { BusinessModule } from './business/business.module';

const HealthController = createHealthController('business-service');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig, businessConfig],
      envFilePath: ['.env', '../../.env'],
    }),
    FastpayMongoModule.forRoot(),
    BusinessModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

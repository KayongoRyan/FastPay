import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { createHealthController } from '@fastpay/common';
import { FastpayMongoModule } from '@fastpay/mongo';

import authConfig from './config/auth.config';
import merchantConfig from './config/merchant.config';
import { MerchantModule } from './merchant/merchant.module';

const HealthController = createHealthController('merchant-service');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig, merchantConfig],
      envFilePath: ['.env', '../../.env'],
    }),
    FastpayMongoModule.forRoot(),
    MerchantModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

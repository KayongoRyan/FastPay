import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { createHealthController } from '@fastpay/common';
import { FastpayMongoModule } from '@fastpay/mongo';

import authConfig from './config/auth.config';
import { InsuranceModule } from './insurance/insurance.module';

const HealthController = createHealthController('insurance-service');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig],
      envFilePath: ['.env', '../../.env'],
    }),
    FastpayMongoModule.forRoot(),
    InsuranceModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

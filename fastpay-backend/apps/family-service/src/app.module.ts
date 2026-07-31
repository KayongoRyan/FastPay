import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { createHealthController } from '@fastpay/common';
import { FastpayMongoModule } from '@fastpay/mongo';

import authConfig from './config/auth.config';
import servicesConfig from './config/services.config';
import { FamilyModule } from './family/family.module';

const HealthController = createHealthController('family-service');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig, servicesConfig],
      envFilePath: ['.env', '../../.env'],
    }),
    FastpayMongoModule.forRoot(),
    FamilyModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

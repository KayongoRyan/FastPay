import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { createHealthController } from '@fastpay/common';

import complianceConfig from './config/compliance.config';
import stellarConfig from './config/stellar.config';
import { ComplianceModule } from './compliance/compliance.module';

const HealthController = createHealthController('fraud-service');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [complianceConfig, stellarConfig],
      envFilePath: ['.env', '../../.env'],
    }),
    ComplianceModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

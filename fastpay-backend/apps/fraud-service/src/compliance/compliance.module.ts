import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import complianceConfig from '../config/compliance.config';
import stellarConfig from '../config/stellar.config';
import { ChainalysisMockController } from './chainalysis-mock.controller';
import { ChainalysisMockService } from './chainalysis-mock.service';
import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';

@Module({
  imports: [
    ConfigModule.forFeature(complianceConfig),
    ConfigModule.forFeature(stellarConfig),
  ],
  controllers: [ChainalysisMockController, ComplianceController],
  providers: [ChainalysisMockService, ComplianceService],
  exports: [ComplianceService],
})
export class ComplianceModule {}

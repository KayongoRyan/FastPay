import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import {
  FraudCase,
  FraudCaseSchema,
  OfflineRelay,
  OfflineRelaySchema,
} from '@fastpay/schemas';

import complianceConfig from '../config/compliance.config';
import stellarConfig from '../config/stellar.config';
import { ChainalysisProviderService } from './chainalysis-provider.service';
import {
  ChainalysisHttpProviderService,
  ConfigurableChainalysisProvider,
} from './chainalysis-http-provider.service';
import { ChainalysisMockController } from './chainalysis-mock.controller';
import { ChainalysisMockService } from './chainalysis-mock.service';
import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';
import { RulesEngineService } from './rules-engine.service';
import { ScreeningOrchestratorService } from './screening-orchestrator.service';

@Module({
  imports: [
    ConfigModule.forFeature(complianceConfig),
    ConfigModule.forFeature(stellarConfig),
    MongooseModule.forFeature([
      { name: OfflineRelay.name, schema: OfflineRelaySchema },
      { name: FraudCase.name, schema: FraudCaseSchema },
    ]),
  ],
  controllers: [ChainalysisMockController, ComplianceController],
  providers: [
    ChainalysisMockService,
    ChainalysisProviderService,
    ChainalysisHttpProviderService,
    ConfigurableChainalysisProvider,
    RulesEngineService,
    ScreeningOrchestratorService,
    ComplianceService,
  ],
  exports: [ComplianceService],
})
export class ComplianceModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { FastpayAuthModule } from '@fastpay/common';
import {
  InsuranceClaim,
  InsuranceClaimSchema,
  InsurancePolicy,
  InsurancePolicySchema,
} from '@fastpay/schemas';

import authConfig from '../config/auth.config';
import {
  InsuranceController,
  InternalInsuranceController,
} from './insurance.controller';
import { InsuranceService } from './insurance.service';
import { RiskEngineService } from './risk-engine.service';

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
    FastpayAuthModule,
    MongooseModule.forFeature([
      { name: InsurancePolicy.name, schema: InsurancePolicySchema },
      { name: InsuranceClaim.name, schema: InsuranceClaimSchema },
    ]),
  ],
  controllers: [InsuranceController, InternalInsuranceController],
  providers: [InsuranceService, RiskEngineService],
  exports: [InsuranceService],
})
export class InsuranceModule {}

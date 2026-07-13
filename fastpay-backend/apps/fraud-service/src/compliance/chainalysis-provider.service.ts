import { Injectable } from '@nestjs/common';

import { ChainalysisMockService } from './chainalysis-mock.service';
import {
  FraudDecision,
  ScreeningProvider,
  ScreeningRequest,
  ScreeningResult,
} from './screening.types';

@Injectable()
export class ChainalysisProviderService implements ScreeningProvider {
  constructor(private readonly mock: ChainalysisMockService) {}

  async screen(request: ScreeningRequest): Promise<ScreeningResult> {
    const result = this.mock.screen({
      address: request.address,
      direction: request.direction,
      asset: request.asset,
      amount: request.amount,
    });

    const decision: FraudDecision = result.allowed ? 'allow' : 'block';
    const riskScore =
      result.risk === 'severe' ? 95 : result.risk === 'high' ? 80 : result.risk === 'medium' ? 45 : 10;

    return {
      allowed: result.allowed,
      decision,
      riskScore,
      reasons: result.reasons,
      ruleHits: result.allowed ? [] : ['address_screen'],
      address: result.address,
      screenedAt: result.screenedAt,
    };
  }
}

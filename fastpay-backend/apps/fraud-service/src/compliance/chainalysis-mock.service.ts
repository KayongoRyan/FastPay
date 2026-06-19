import { Injectable } from '@nestjs/common';

import {
  ChainalysisScreenRequest,
  ChainalysisScreenResponse,
  ComplianceRiskLevel,
} from './interfaces/compliance.types';

@Injectable()
export class ChainalysisMockService {
  screen(request: ChainalysisScreenRequest): ChainalysisScreenResponse {
    const normalized = request.address.toUpperCase();
    const reasons: string[] = [];
    let risk: ComplianceRiskLevel = 'low';
    let allowed = true;

    if (normalized.includes('SANCTIONED')) {
      risk = 'severe';
      allowed = false;
      reasons.push('Address matches sanctions list (mock)');
    } else if (normalized.endsWith('BLOCK')) {
      risk = 'high';
      allowed = false;
      reasons.push('Address flagged for high-risk activity (mock)');
    } else if (normalized.includes('REVIEW')) {
      risk = 'medium';
      reasons.push('Address requires enhanced due diligence (mock)');
    }

    if (allowed && reasons.length === 0) {
      reasons.push('No compliance issues detected (mock)');
    }

    return {
      address: request.address,
      risk,
      allowed,
      reasons,
      screenedAt: new Date().toISOString(),
    };
  }
}

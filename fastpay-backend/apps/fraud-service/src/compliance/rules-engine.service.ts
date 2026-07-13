import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { OfflineRelay, OfflineRelayDocument } from '@fastpay/schemas';

import {
  FraudDecision,
  ScreeningRequest,
  ScreeningResult,
} from './screening.types';

const KYC_AMOUNT_LIMITS: Record<number, number> = {
  0: 500,
  1: 5000,
  2: 50000,
  3: 500000,
};

@Injectable()
export class RulesEngineService {
  constructor(
    @InjectModel(OfflineRelay.name)
    private readonly relayModel: Model<OfflineRelayDocument>,
  ) {}

  async evaluate(request: ScreeningRequest): Promise<ScreeningResult> {
    const ruleHits: string[] = [];
    const reasons: string[] = [];
    let riskScore = 0;
    let decision: FraudDecision = 'allow';

    if (request.txHash) {
      const duplicate = await this.relayModel.findOne({ txHash: request.txHash }).exec();
      if (duplicate) {
        ruleHits.push('duplicate_xdr');
        reasons.push('This transaction was already submitted');
        return this.buildResult(request.address, false, 'block', 100, reasons, ruleHits);
      }
    }

    if (request.amount) {
      const amount = Number.parseFloat(request.amount);
      const limit = KYC_AMOUNT_LIMITS[2] ?? 50000;
      if (!Number.isNaN(amount) && amount > limit) {
        ruleHits.push('amount_threshold');
        reasons.push('Amount exceeds default review threshold');
        riskScore += 40;
        decision = 'review';
      }
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const velocity = await this.relayModel.countDocuments({
      createdAt: { $gte: since },
      status: { $ne: 'failed' },
    });
    if (velocity >= 20) {
      ruleHits.push('velocity_24h');
      reasons.push('High transaction velocity detected');
      riskScore += 50;
      decision = 'block';
    } else if (velocity >= 10) {
      ruleHits.push('velocity_24h');
      reasons.push('Elevated transaction velocity');
      riskScore += 25;
      if (decision === 'allow') decision = 'review';
    }

    if (request.destination) {
      const seen = await this.relayModel.countDocuments({
        signedXdr: { $regex: request.destination },
        status: 'confirmed',
      });
      if (seen === 0) {
        ruleHits.push('new_recipient');
        reasons.push('First payment to this recipient');
        riskScore += 15;
        if (decision === 'allow') decision = 'review';
      }
    }

    const hour = new Date().getUTCHours();
    if (request.amount && Number.parseFloat(request.amount) > 1000 && (hour < 6 || hour > 22)) {
      ruleHits.push('off_hours');
      reasons.push('Large transaction outside typical hours');
      riskScore += 20;
      if (decision === 'allow') decision = 'review';
    }

    if (reasons.length === 0) {
      reasons.push('No rule violations detected');
    }

    return this.buildResult(
      request.address,
      decision !== 'block',
      decision,
      Math.min(riskScore, 100),
      reasons,
      ruleHits,
    );
  }

  private buildResult(
    address: string,
    allowed: boolean,
    decision: FraudDecision,
    riskScore: number,
    reasons: string[],
    ruleHits: string[],
  ): ScreeningResult {
    return {
      address,
      allowed,
      decision,
      riskScore,
      reasons,
      ruleHits,
      screenedAt: new Date().toISOString(),
    };
  }
}

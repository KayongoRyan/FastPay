import { createHash } from 'crypto';

import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FeeBumpTransaction, Operation, TransactionBuilder } from '@stellar/stellar-sdk';
import { Model, Types } from 'mongoose';

import {
  FraudCase,
  FraudCaseDocument,
  FraudCaseStatus,
  FraudDecision as FraudCaseDecision,
} from '@fastpay/schemas';
import { ConfigService } from '@nestjs/config';

import { ChainalysisProviderService } from './chainalysis-provider.service';
import { RulesEngineService } from './rules-engine.service';
import { ScreeningRequest, ScreeningResult } from './screening.types';

@Injectable()
export class ScreeningOrchestratorService {
  private readonly networkPassphrase: string;

  constructor(
    private readonly chainalysisProvider: ChainalysisProviderService,
    private readonly rulesEngine: RulesEngineService,
    @InjectModel(FraudCase.name)
    private readonly fraudCaseModel: Model<FraudCaseDocument>,
    private readonly configService: ConfigService,
  ) {
    this.networkPassphrase = this.configService.getOrThrow<string>(
      'stellar.networkPassphrase',
    );
  }

  async screen(request: ScreeningRequest): Promise<ScreeningResult> {
    const [rules, address] = await Promise.all([
      this.rulesEngine.evaluate(request),
      this.chainalysisProvider.screen(request),
    ]);

    return this.mergeResults(rules, address);
  }

  async assertSignedTransactionAllowed(
    signedXdr: string,
    userId?: string,
  ): Promise<ScreeningResult> {
    const parsed = TransactionBuilder.fromXDR(
      signedXdr,
      this.networkPassphrase,
    );

    if (parsed instanceof FeeBumpTransaction) {
      throw new ForbiddenException(
        'Compliance check blocked signed transaction: fee bump transactions are not supported',
      );
    }

    const txHash = this.hashXdr(signedXdr);
    const paymentOps = parsed.operations.filter((op) => op.type === 'payment');

    let worst: ScreeningResult = {
      allowed: true,
      decision: 'allow',
      riskScore: 0,
      reasons: ['No payment operations'],
      ruleHits: [],
      address: parsed.source,
      screenedAt: new Date().toISOString(),
    };

    if (paymentOps.length === 0) {
      return worst;
    }

    const sourceResult = await this.screen({
      address: parsed.source,
      direction: 'outgoing',
      userId,
      txHash,
      source: parsed.source,
    });
    worst = this.pickWorst(worst, sourceResult);

    const seen = new Set<string>();
    for (const operation of paymentOps) {
      const payment = operation as Operation.Payment;
      if (seen.has(payment.destination)) continue;
      seen.add(payment.destination);

      const destResult = await this.screen({
        address: payment.destination,
        direction: 'outgoing',
        amount: payment.amount,
        asset: payment.asset.isNative()
          ? 'XLM'
          : `${payment.asset.getCode()}:${payment.asset.getIssuer()}`,
        userId,
        txHash,
        source: parsed.source,
        destination: payment.destination,
      });
      worst = this.pickWorst(worst, destResult);
    }

    if (worst.decision === 'block') {
      await this.recordFraudCase(txHash, userId, worst);
      throw new ForbiddenException(
        'This transaction cannot be processed for security reasons.',
      );
    }

    if (worst.decision === 'review') {
      await this.recordFraudCase(txHash, userId, worst);
    }

    return worst;
  }

  private async recordFraudCase(
    txHash: string,
    userId: string | undefined,
    result: ScreeningResult,
  ): Promise<void> {
    await this.fraudCaseModel
      .updateOne(
        { txHash },
        {
          $set: {
            userId: userId ? new Types.ObjectId(userId) : undefined,
            decision: result.decision as FraudCaseDecision,
            riskScore: result.riskScore,
            ruleHits: result.ruleHits,
            reasons: result.reasons,
            status: FraudCaseStatus.OPEN,
            context: { screenedAt: result.screenedAt },
          },
        },
        { upsert: true },
      )
      .exec();
  }

  private mergeResults(a: ScreeningResult, b: ScreeningResult): ScreeningResult {
    return this.pickWorst(a, b);
  }

  private pickWorst(a: ScreeningResult, b: ScreeningResult): ScreeningResult {
    const order = { block: 3, review: 2, allow: 1 };
    if (order[b.decision] > order[a.decision]) return b;
    if (order[b.decision] < order[a.decision]) return a;
    return b.riskScore >= a.riskScore ? b : a;
  }

  private hashXdr(signedXdr: string): string {
    return createHash('sha256').update(signedXdr).digest('hex');
  }
}

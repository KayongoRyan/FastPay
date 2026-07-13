import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { ScreeningOrchestratorService } from './screening-orchestrator.service';
import { ScreeningRequest, ScreeningResult } from './screening.types';

@Injectable()
export class ComplianceService {
  constructor(private readonly orchestrator: ScreeningOrchestratorService) {}

  async screen(request: ScreeningRequest): Promise<ScreeningResult> {
    return this.orchestrator.screen(request);
  }

  async assertOutgoingPaymentAllowed(params: {
    source: string;
    destination: string;
    amount?: string;
    asset?: string;
    userId?: string;
  }): Promise<ScreeningResult> {
    const source = await this.orchestrator.screen({
      address: params.source,
      direction: 'outgoing',
      source: params.source,
      destination: params.destination,
      amount: params.amount,
      asset: params.asset,
      userId: params.userId,
    });
    const dest = await this.orchestrator.screen({
      address: params.destination,
      direction: 'outgoing',
      source: params.source,
      destination: params.destination,
      amount: params.amount,
      asset: params.asset,
      userId: params.userId,
    });

    if (dest.decision === 'block' || source.decision === 'block') {
      const worst = dest.decision === 'block' ? dest : source;
      throw new ForbiddenException(
        'This transaction cannot be processed for security reasons.',
      );
    }
    return dest.riskScore >= source.riskScore ? dest : source;
  }

  async assertSignedTransactionAllowed(
    signedXdr: string,
    userId?: string,
  ): Promise<ScreeningResult> {
    return this.orchestrator.assertSignedTransactionAllowed(signedXdr, userId);
  }
}

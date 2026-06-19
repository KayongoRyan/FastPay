import {
  ForbiddenException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FeeBumpTransaction, Operation, TransactionBuilder } from '@stellar/stellar-sdk';

import {
  ChainalysisScreenResponse,
  ComplianceScreenDirection,
} from './interfaces/compliance.types';

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);
  private readonly chainalysisMockUrl: string;
  private readonly chainalysisApiKey: string;
  private readonly networkPassphrase: string;

  constructor(private readonly configService: ConfigService) {
    this.chainalysisMockUrl = this.configService.getOrThrow<string>(
      'compliance.chainalysisMockUrl',
    );
    this.chainalysisApiKey = this.configService.getOrThrow<string>(
      'compliance.chainalysisApiKey',
    );
    this.networkPassphrase = this.configService.getOrThrow<string>(
      'stellar.networkPassphrase',
    );
  }

  async assertOutgoingPaymentAllowed(params: {
    source: string;
    destination: string;
    amount?: string;
    asset?: string;
  }): Promise<ChainalysisScreenResponse[]> {
    const results = await Promise.all([
      this.screenAddress(params.source, 'outgoing', params),
      this.screenAddress(params.destination, 'outgoing', params),
    ]);

    this.assertAllAllowed(results, 'outgoing payment');
    return results;
  }

  async assertSignedTransactionAllowed(signedXdr: string): Promise<ChainalysisScreenResponse[]> {
    const parsed = TransactionBuilder.fromXDR(
      signedXdr,
      this.networkPassphrase,
    );

    if (parsed instanceof FeeBumpTransaction) {
      throw new ForbiddenException(
        'Compliance check blocked signed transaction: fee bump transactions are not supported',
      );
    }

    const transaction = parsed;

    const paymentOps = transaction.operations.filter(
      (operation) => operation.type === 'payment',
    );

    if (paymentOps.length === 0) {
      return [];
    }

    const results: ChainalysisScreenResponse[] = [];
    const seen = new Set<string>();

    results.push(
      await this.screenAddress(transaction.source, 'outgoing'),
    );
    seen.add(transaction.source);

    for (const operation of paymentOps) {
      const payment = operation as Operation.Payment;
      if (seen.has(payment.destination)) {
        continue;
      }

      results.push(
        await this.screenAddress(payment.destination, 'outgoing', {
          amount: payment.amount,
          asset: payment.asset.isNative()
            ? 'XLM'
            : `${payment.asset.getCode()}:${payment.asset.getIssuer()}`,
        }),
      );
      seen.add(payment.destination);
    }

    this.assertAllAllowed(results, 'signed transaction');
    return results;
  }

  private async screenAddress(
    address: string,
    direction: ComplianceScreenDirection,
    context?: { amount?: string; asset?: string },
  ): Promise<ChainalysisScreenResponse> {
    const url = `${this.chainalysisMockUrl.replace(/\/$/, '')}/screen`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.chainalysisApiKey,
        },
        body: JSON.stringify({
          address,
          direction,
          amount: context?.amount,
          asset: context?.asset,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new ServiceUnavailableException(
          `Chainalysis mock screening failed (${response.status}): ${body}`,
        );
      }

      return (await response.json()) as ChainalysisScreenResponse;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      this.logger.error(
        `Chainalysis mock API unreachable for ${address}: ${error instanceof Error ? error.message : error}`,
      );
      throw new ServiceUnavailableException(
        'Compliance screening is unavailable. Send blocked.',
      );
    }
  }

  private assertAllAllowed(
    results: ChainalysisScreenResponse[],
    context: string,
  ): void {
    const blocked = results.filter((result) => !result.allowed);
    if (blocked.length === 0) {
      return;
    }

    const detail = blocked
      .map(
        (result) =>
          `${result.address} (${result.risk}: ${result.reasons.join(', ')})`,
      )
      .join('; ');

    throw new ForbiddenException(
      `Compliance check blocked ${context}: ${detail}`,
    );
  }
}

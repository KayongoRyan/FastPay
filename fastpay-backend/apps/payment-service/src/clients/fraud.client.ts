import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface FraudScreenResult {
  allowed: boolean;
  decision: 'allow' | 'review' | 'block';
  riskScore: number;
  reasons: string[];
  ruleHits: string[];
}

@Injectable()
export class FraudClient {
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService
      .getOrThrow<string>('services.fraudUrl')
      .replace(/\/$/, '');
  }

  async assertSignedTransaction(signedXdr: string): Promise<FraudScreenResult> {
    const response = await fetch(`${this.baseUrl}/compliance/transactions/assert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signedXdr }),
    });

    if (response.status === 403) {
      throw new ForbiddenException(
        'This transaction cannot be processed for security reasons.',
      );
    }

    if (!response.ok) {
      throw new Error(`Fraud check failed (${response.status})`);
    }

    return (await response.json()) as FraudScreenResult;
  }
}

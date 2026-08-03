import {
  ForbiddenException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
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
  private readonly logger = new Logger(FraudClient.name);
  private readonly baseUrl: string;
  private readonly optional: boolean;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService
      .getOrThrow<string>('services.fraudUrl')
      .replace(/\/$/, '');
    this.optional = process.env.FASTPAY_FRAUD_OPTIONAL === 'true';
  }

  async assertSignedTransaction(signedXdr: string): Promise<FraudScreenResult> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/compliance/transactions/assert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signedXdr }),
      });
    } catch {
      if (this.optional) {
        this.logger.warn(
          `Fraud service unreachable at ${this.baseUrl}; allowing (FASTPAY_FRAUD_OPTIONAL)`,
        );
        return {
          allowed: true,
          decision: 'allow',
          riskScore: 0,
          reasons: ['fraud-optional-skip'],
          ruleHits: [],
        };
      }
      throw new ServiceUnavailableException(
        `Fraud service unreachable at ${this.baseUrl}. Start fraud-service (:3011) or set FASTPAY_FRAUD_OPTIONAL=true`,
      );
    }

    if (response.status === 403) {
      throw new ForbiddenException(
        'This transaction cannot be processed for security reasons.',
      );
    }

    if (!response.ok) {
      throw new ServiceUnavailableException(
        `Fraud check failed (${response.status})`,
      );
    }

    return (await response.json()) as FraudScreenResult;
  }
}

import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FraudClient {
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService
      .getOrThrow<string>('services.fraudUrl')
      .replace(/\/$/, '');
  }

  async assertSignedTransaction(signedXdr: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/compliance/transactions/assert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signedXdr }),
    });

    if (response.status === 403) {
      throw new ForbiddenException(await response.text());
    }

    if (!response.ok) {
      throw new Error(`Fraud check failed (${response.status})`);
    }
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentClient {
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService
      .getOrThrow<string>('services.paymentUrl')
      .replace(/\/$/, '');
  }

  async relay(signedTxXDR: string, recipientPhone?: string) {
    const response = await fetch(`${this.baseUrl}/offline/relay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signedTxXDR, recipientPhone }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Payment relay failed (${response.status}): ${text}`);
    }

    return response.json() as Promise<{
      accepted: boolean;
      queueId: string;
      txHash: string;
      estimatedSeconds: number;
    }>;
  }

  async getRelayStatus(txHash: string) {
    const response = await fetch(`${this.baseUrl}/offline/relay/${txHash}`);
    if (!response.ok) {
      throw new Error(`Relay status failed (${response.status})`);
    }
    return response.json() as Promise<{
      txHash: string;
      status: string;
      onChainTxHash?: string;
    }>;
  }

  async getHistory(publicKey: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/payments/history/${encodeURIComponent(publicKey)}`,
        {
          headers: {
            'X-Internal-Secret':
              process.env.INTERNAL_SERVICE_SECRET ??
              'dev-internal-secret-change-in-production',
          },
        },
      );
      if (!response.ok) {
        return [];
      }
      return (await response.json()) as Array<{
        id: string;
        txHash: string;
        status: string;
        amount: string;
        asset: string;
        direction: 'in' | 'out';
        counterparty: string;
        createdAt: string;
      }>;
    } catch {
      // Payment service optional for wallet balance views in local dev.
      return [];
    }
  }
}

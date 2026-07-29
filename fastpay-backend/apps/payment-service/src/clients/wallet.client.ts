import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WalletClient {
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService
      .getOrThrow<string>('services.walletUrl')
      .replace(/\/$/, '');
  }

  async transfer(
    accessToken: string,
    input: { destination: string; amountRwf: number; memo?: string },
  ) {
    const response = await fetch(`${this.baseUrl}/wallet/me/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Wallet transfer failed (${response.status}): ${text}`);
    }

    return response.json() as Promise<{
      txHash: string;
      queueId: string;
      estimatedSeconds: number;
      amountRwf: number;
      destination: string;
    }>;
  }
}

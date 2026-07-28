import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface StellarAccountKeys {
  publicKey: string;
  secretKey: string;
}

export interface StellarBalance {
  balance: string;
  assetType: string;
  assetCode?: string;
}

@Injectable()
export class BlockchainClient {
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService
      .getOrThrow<string>('services.blockchainUrl')
      .replace(/\/$/, '');
  }

  async createAccount(): Promise<StellarAccountKeys> {
    const response = await fetch(`${this.baseUrl}/stellar/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fundWithFriendbot: true }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Blockchain createAccount failed (${response.status}): ${text}`);
    }

    return (await response.json()) as StellarAccountKeys;
  }

  async getBalance(publicKey: string): Promise<StellarBalance[]> {
    const response = await fetch(
      `${this.baseUrl}/stellar/accounts/${encodeURIComponent(publicKey)}/balance`,
    );

    if (!response.ok) {
      throw new Error(`Blockchain balance failed (${response.status})`);
    }

    return (await response.json()) as StellarBalance[];
  }

  async buildPayment(params: {
    sourceSecret: string;
    destination: string;
    amount: string;
    memo?: string;
  }): Promise<{ xdr: string; hash: string }> {
    const response = await fetch(`${this.baseUrl}/stellar/transactions/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Blockchain buildPayment failed (${response.status}): ${text}`);
    }

    return (await response.json()) as { xdr: string; hash: string };
  }
}

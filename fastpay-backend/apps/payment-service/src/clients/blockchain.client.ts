import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BlockchainClient {
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService
      .getOrThrow<string>('services.blockchainUrl')
      .replace(/\/$/, '');
  }

  async verifySignedXdr(xdr: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/stellar/transactions/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ xdr }),
    });

    if (!response.ok) {
      throw new Error(`Blockchain verify failed (${response.status})`);
    }

    const body = (await response.json()) as { valid: boolean };
    return body.valid;
  }

  async submit(xdr: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/stellar/transactions/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ xdr }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Blockchain submit failed (${response.status}): ${text}`);
    }

    const body = (await response.json()) as { hash: string };
    return body.hash;
  }

  async getAccountSequence(publicKey: string): Promise<string> {
    const response = await fetch(
      `${this.baseUrl}/stellar/accounts/${encodeURIComponent(publicKey)}/sequence`,
    );

    if (!response.ok) {
      throw new Error(`Blockchain sequence lookup failed (${response.status})`);
    }

    const body = (await response.json()) as { sequence: string };
    return body.sequence;
  }
}

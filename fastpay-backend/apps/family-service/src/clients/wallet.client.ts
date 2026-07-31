import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WalletClient {
  private readonly logger = new Logger(WalletClient.name);
  private readonly baseUrl: string;
  private readonly internalSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService
      .getOrThrow<string>('services.walletUrl')
      .replace(/\/$/, '');
    this.internalSecret = this.configService.getOrThrow<string>(
      'auth.internalServiceSecret',
    );
  }

  async provisionForUser(userId: string): Promise<{ publicKey?: string } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/internal/provision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': this.internalSecret,
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const text = await response.text();
        this.logger.warn(
          `Wallet provision failed for ${userId} (${response.status}): ${text}`,
        );
        return null;
      }

      return (await response.json()) as { publicKey?: string };
    } catch (error) {
      this.logger.warn(
        `Wallet provision unreachable for ${userId}: ${
          error instanceof Error ? error.message : error
        }`,
      );
      return null;
    }
  }

  async transferForUser(input: {
    userId: string;
    destination: string;
    amountRwf: number;
    memo?: string;
  }) {
    const response = await fetch(`${this.baseUrl}/internal/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': this.internalSecret,
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as {
        message?: string | string[];
      };
      const message = Array.isArray(body.message)
        ? body.message.join('. ')
        : body.message ?? `Transfer failed (${response.status})`;
      throw new Error(message);
    }

    return response.json();
  }
}

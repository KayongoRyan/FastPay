import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MerchantClient {
  private readonly logger = new Logger(MerchantClient.name);
  private readonly baseUrl: string;
  private readonly internalSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService
      .getOrThrow<string>('services.merchantUrl')
      .replace(/\/$/, '');
    this.internalSecret =
      process.env.INTERNAL_SERVICE_SECRET ?? 'dev-internal-secret-change-in-production';
  }

  async lookup(code: string) {
    const res = await fetch(
      `${this.baseUrl}/merchant/lookup/${encodeURIComponent(code.trim().toUpperCase())}`,
    );
    if (!res.ok) return null;
    const body = (await res.json()) as { found?: boolean; code?: string; name?: string; orgId?: string };
    if (body.found === false || !body.orgId) return null;
    return { code: body.code!, name: body.name!, orgId: body.orgId! };
  }

  async recordPayment(input: {
    orgId: string;
    amountRwf: number;
    channel: 'bank_pay' | 'invoice' | 'qr';
    consumerUserId?: string;
    merchantCode?: string;
    paymentRef?: string;
    txHash?: string;
    beneficiaryLabel?: string;
  }) {
    const res = await fetch(`${this.baseUrl}/internal/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': this.internalSecret,
      },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Merchant payment record failed (${res.status}): ${text}`);
    }
    return res.json();
  }
}

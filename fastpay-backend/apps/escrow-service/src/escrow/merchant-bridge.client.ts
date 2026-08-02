import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MerchantBridgeClient {
  private readonly logger = new Logger(MerchantBridgeClient.name);
  private readonly baseUrl: string;
  private readonly internalSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = (
      this.configService.get<string>('services.merchantUrl') ??
      'http://localhost:3006'
    ).replace(/\/$/, '');
    this.internalSecret =
      this.configService.get<string>('auth.internalServiceSecret') ??
      process.env.INTERNAL_SERVICE_SECRET ??
      'dev-internal-secret-change-in-production';
  }

  async lookup(code: string) {
    try {
      const res = await fetch(
        `${this.baseUrl}/merchant/lookup/${encodeURIComponent(code.trim().toUpperCase())}`,
      );
      if (!res.ok) return null;
      const body = (await res.json()) as {
        found?: boolean;
        code?: string;
        name?: string;
        orgId?: string;
      };
      if (body.found === false || !body.orgId) return null;
      return { code: body.code!, name: body.name!, orgId: body.orgId! };
    } catch (error) {
      this.logger.warn(
        `Merchant lookup failed: ${error instanceof Error ? error.message : error}`,
      );
      return null;
    }
  }

  async createOrder(input: {
    merchantOrgId: string;
    buyerUserId: string;
    amountRwf: number;
    title?: string;
    description?: string;
    escrowId?: string;
  }) {
    try {
      const res = await fetch(`${this.baseUrl}/internal/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': this.internalSecret,
        },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        this.logger.warn(`Create order failed (${res.status}): ${await res.text()}`);
        return null;
      }
      return (await res.json()) as { orderId: string; orderNumber: string };
    } catch (error) {
      this.logger.warn(
        `Create order unreachable: ${error instanceof Error ? error.message : error}`,
      );
      return null;
    }
  }

  async updateOrderStatus(input: {
    orderId: string;
    status: string;
    shippingNote?: string;
  }) {
    try {
      const res = await fetch(`${this.baseUrl}/internal/orders/${input.orderId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': this.internalSecret,
        },
        body: JSON.stringify({
          status: input.status,
          shippingNote: input.shippingNote,
        }),
      });
      if (!res.ok) {
        this.logger.warn(`Update order failed (${res.status}): ${await res.text()}`);
      }
    } catch (error) {
      this.logger.warn(
        `Update order unreachable: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  async recordSettlement(input: {
    orgId: string;
    amountRwf: number;
    consumerUserId: string;
    merchantCode?: string;
    paymentRef?: string;
  }) {
    const res = await fetch(`${this.baseUrl}/internal/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': this.internalSecret,
      },
      body: JSON.stringify({
        ...input,
        channel: 'escrow',
        beneficiaryLabel: 'Escrow release',
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Escrow settlement failed (${res.status}): ${text}`);
    }
    return res.json();
  }
}

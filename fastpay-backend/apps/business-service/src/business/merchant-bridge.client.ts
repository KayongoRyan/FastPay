import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MerchantBridgeClient {
  private readonly logger = new Logger(MerchantBridgeClient.name);
  private readonly baseUrl: string;
  private readonly internalSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = (
      this.configService.get<string>('business.merchantServiceUrl') ??
      process.env.MERCHANT_SERVICE_URL ??
      'http://localhost:3006'
    ).replace(/\/$/, '');
    this.internalSecret =
      process.env.INTERNAL_SERVICE_SECRET ?? 'dev-internal-secret-change-in-production';
  }

  async createBranch(input: {
    ownerUserId: string;
    businessName: string;
    businessOrgId: string;
    category?: string;
    businessEmail?: string;
    businessPhone?: string;
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/internal/orgs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': this.internalSecret,
        },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const text = await response.text();
        this.logger.warn(`Create branch failed (${response.status}): ${text}`);
        return null;
      }
      return (await response.json()) as {
        orgId: string;
        merchantCode: string;
        businessName: string;
        totalReceivedRwf?: number;
      };
    } catch (error) {
      this.logger.warn(
        `Merchant unreachable: ${error instanceof Error ? error.message : error}`,
      );
      return null;
    }
  }

  async linkMerchant(input: {
    merchantCode: string;
    businessOrgId: string;
    ownerUserId: string;
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/internal/orgs/link-business`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': this.internalSecret,
        },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const text = await response.text();
        return { ok: false as const, message: text || `HTTP ${response.status}` };
      }
      return {
        ok: true as const,
        org: (await response.json()) as {
          orgId: string;
          merchantCode: string;
          businessName: string;
          totalReceivedRwf: number;
          status: string;
        },
      };
    } catch (error) {
      return {
        ok: false as const,
        message: error instanceof Error ? error.message : 'Merchant unreachable',
      };
    }
  }

  async listByBusiness(businessOrgId: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/internal/orgs/by-business/${encodeURIComponent(businessOrgId)}`,
        {
          headers: { 'X-Internal-Secret': this.internalSecret },
        },
      );
      if (!response.ok) return [];
      return (await response.json()) as Array<{
        orgId: string;
        merchantCode: string;
        businessName: string;
        totalReceivedRwf: number;
        status: string;
        category?: string;
      }>;
    } catch {
      return [];
    }
  }
}

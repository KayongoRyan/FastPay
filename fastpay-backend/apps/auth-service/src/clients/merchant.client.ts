import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface CreateMerchantOrgResult {
  orgId: string;
  merchantCode: string;
  businessName: string;
}

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

  async createOrg(input: {
    ownerUserId: string;
    businessName: string;
    category: string;
    businessEmail?: string;
    businessPhone?: string;
    address?: string;
    city?: string;
    taxId?: string;
  }): Promise<CreateMerchantOrgResult | null> {
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
        this.logger.warn(
          `Merchant org create failed for ${input.ownerUserId} (${response.status}): ${text}`,
        );
        return null;
      }

      return (await response.json()) as CreateMerchantOrgResult;
    } catch (error) {
      this.logger.warn(
        `Merchant service unreachable for ${input.ownerUserId}: ${
          error instanceof Error ? error.message : error
        }`,
      );
      return null;
    }
  }
}

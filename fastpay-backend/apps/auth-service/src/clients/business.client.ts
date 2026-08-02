import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface CreateBusinessOrgResult {
  orgId: string;
  businessCode: string;
  companyName: string;
}

@Injectable()
export class BusinessClient {
  private readonly logger = new Logger(BusinessClient.name);
  private readonly baseUrl: string;
  private readonly internalSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService
      .getOrThrow<string>('services.businessUrl')
      .replace(/\/$/, '');
    this.internalSecret =
      process.env.INTERNAL_SERVICE_SECRET ?? 'dev-internal-secret-change-in-production';
  }

  async createOrg(input: {
    ownerUserId: string;
    companyName: string;
    businessType: string;
    industry?: string;
    companyEmail?: string;
    companyPhone?: string;
    address?: string;
    city?: string;
    country?: string;
    taxId?: string;
    registrationNumber?: string;
    website?: string;
    description?: string;
  }): Promise<CreateBusinessOrgResult | null> {
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
          `Business org create failed for ${input.ownerUserId} (${response.status}): ${text}`,
        );
        return null;
      }

      return (await response.json()) as CreateBusinessOrgResult;
    } catch (error) {
      this.logger.warn(
        `Business service unreachable for ${input.ownerUserId}: ${
          error instanceof Error ? error.message : error
        }`,
      );
      return null;
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ChainalysisMockService } from './chainalysis-mock.service';
import { ChainalysisProviderService } from './chainalysis-provider.service';
import {
  FraudDecision,
  ScreeningProvider,
  ScreeningRequest,
  ScreeningResult,
} from './screening.types';

@Injectable()
export class ChainalysisHttpProviderService implements ScreeningProvider {
  private readonly logger = new Logger(ChainalysisHttpProviderService.name);
  private readonly httpUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly mock: ChainalysisMockService,
  ) {
    this.httpUrl = this.configService.get<string>('compliance.chainalysisHttpUrl') ?? '';
    this.apiKey = this.configService.get<string>('compliance.chainalysisApiKey') ?? '';
  }

  async screen(request: ScreeningRequest): Promise<ScreeningResult> {
    if (!this.httpUrl) {
      this.logger.warn('CHAINALYSIS_HTTP_URL unset — falling back to mock provider');
      return new ChainalysisProviderService(this.mock).screen(request);
    }

    try {
      const res = await fetch(`${this.httpUrl.replace(/\/$/, '')}/screen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'X-API-Key': this.apiKey } : {}),
        },
        body: JSON.stringify({
          address: request.address,
          direction: request.direction,
          asset: request.asset,
          amount: request.amount,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const body = (await res.json()) as {
        allowed?: boolean;
        risk?: string;
        reasons?: string[];
      };

      const allowed = body.allowed !== false;
      const risk = body.risk ?? 'low';
      const decision: FraudDecision = allowed ? 'allow' : 'block';
      const riskScore =
        risk === 'severe' ? 95 : risk === 'high' ? 80 : risk === 'medium' ? 45 : 10;

      return {
        allowed,
        decision,
        riskScore,
        reasons: body.reasons ?? [],
        ruleHits: allowed ? [] : ['address_screen'],
        address: request.address,
        screenedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.warn(
        `Chainalysis HTTP provider failed (${error instanceof Error ? error.message : error}) — using mock`,
      );
      return new ChainalysisProviderService(this.mock).screen(request);
    }
  }
}

@Injectable()
export class ConfigurableChainalysisProvider implements ScreeningProvider {
  constructor(
    private readonly configService: ConfigService,
    private readonly mockProvider: ChainalysisProviderService,
    private readonly httpProvider: ChainalysisHttpProviderService,
  ) {}

  screen(request: ScreeningRequest): Promise<ScreeningResult> {
    const mode = this.configService.get<string>('compliance.chainalysisProvider') ?? 'mock';
    if (mode === 'http') {
      return this.httpProvider.screen(request);
    }
    return this.mockProvider.screen(request);
  }
}

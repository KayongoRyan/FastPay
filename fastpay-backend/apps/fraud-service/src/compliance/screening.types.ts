import { ComplianceScreenDirection } from './interfaces/compliance.types';

export type FraudDecision = 'allow' | 'review' | 'block';

export interface ScreeningRequest {
  address: string;
  direction: ComplianceScreenDirection;
  asset?: string;
  amount?: string;
  userId?: string;
  txHash?: string;
  source?: string;
  destination?: string;
}

export interface ScreeningResult {
  allowed: boolean;
  decision: FraudDecision;
  riskScore: number;
  reasons: string[];
  ruleHits: string[];
  address: string;
  screenedAt: string;
}

export interface ScreeningProvider {
  screen(request: ScreeningRequest): Promise<ScreeningResult>;
}

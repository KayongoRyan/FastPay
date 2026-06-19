export type ComplianceRiskLevel = 'low' | 'medium' | 'high' | 'severe';

export type ComplianceScreenDirection = 'outgoing' | 'incoming';

export interface ChainalysisScreenRequest {
  address: string;
  direction: ComplianceScreenDirection;
  asset?: string;
  amount?: string;
}

export interface ChainalysisScreenResponse {
  address: string;
  risk: ComplianceRiskLevel;
  allowed: boolean;
  reasons: string[];
  screenedAt: string;
}

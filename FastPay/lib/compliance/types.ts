export type ComplianceRiskLevel = 'low' | 'medium' | 'high' | 'severe';

export interface ComplianceScreenResult {
  address: string;
  risk: ComplianceRiskLevel;
  allowed: boolean;
  reasons: string[];
  screenedAt: string;
}

export class ComplianceBlockedError extends Error {
  readonly results: ComplianceScreenResult[];

  constructor(message: string, results: ComplianceScreenResult[]) {
    super(message);
    this.name = 'ComplianceBlockedError';
    this.results = results;
  }
}

import {
  ComplianceBlockedError,
  type ComplianceScreenResult,
} from './types';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

interface UnifiedScreenResult {
  allowed: boolean;
  decision: 'allow' | 'review' | 'block';
  riskScore: number;
  reasons: string[];
  ruleHits: string[];
  address: string;
  screenedAt: string;
}

export async function screenOutgoingAddress(params: {
  address: string;
  amount?: string;
  asset?: string;
  source?: string;
  destination?: string;
}): Promise<ComplianceScreenResult> {
  const response = await fetch(`${API_URL}/compliance/screen`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address: params.address,
      direction: 'outgoing',
      amount: params.amount,
      asset: params.asset,
      source: params.source,
      destination: params.destination,
    }),
  });

  if (!response.ok) {
    throw new Error(`Compliance screening failed (${response.status})`);
  }

  const result = (await response.json()) as UnifiedScreenResult;
  return {
    address: result.address,
    risk: result.riskScore >= 80 ? 'high' : result.riskScore >= 40 ? 'medium' : 'low',
    allowed: result.allowed && result.decision !== 'block',
    reasons: result.reasons,
    screenedAt: result.screenedAt,
  };
}

export async function assertSendAllowed(params: {
  source: string;
  destination: string;
  amount?: string;
  asset?: string;
}): Promise<ComplianceScreenResult[]> {
  const [source, destination] = await Promise.all([
    screenOutgoingAddress({
      address: params.source,
      amount: params.amount,
      asset: params.asset,
      source: params.source,
      destination: params.destination,
    }),
    screenOutgoingAddress({
      address: params.destination,
      amount: params.amount,
      asset: params.asset,
      source: params.source,
      destination: params.destination,
    }),
  ]);

  const blocked = [source, destination].filter((result) => !result.allowed);
  if (blocked.length > 0) {
    throw new ComplianceBlockedError(
      'This transfer is blocked for security reasons.',
      blocked,
    );
  }

  return [source, destination];
}

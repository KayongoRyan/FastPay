import {
  ComplianceBlockedError,
  type ComplianceScreenResult,
} from './types';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function screenOutgoingAddress(params: {
  address: string;
  amount?: string;
  asset?: string;
}): Promise<ComplianceScreenResult> {
  const response = await fetch(`${API_URL}/compliance/chainalysis/screen`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address: params.address,
      direction: 'outgoing',
      amount: params.amount,
      asset: params.asset,
    }),
  });

  if (!response.ok) {
    throw new Error(`Compliance screening failed (${response.status})`);
  }

  return (await response.json()) as ComplianceScreenResult;
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
    }),
    screenOutgoingAddress({
      address: params.destination,
      amount: params.amount,
      asset: params.asset,
    }),
  ]);

  const blocked = [source, destination].filter((result) => !result.allowed);
  if (blocked.length > 0) {
    const detail = blocked
      .map((result) => `${result.address} (${result.risk})`)
      .join(', ');
    throw new ComplianceBlockedError(
      `Send blocked by compliance: ${detail}`,
      blocked,
    );
  }

  return [source, destination];
}

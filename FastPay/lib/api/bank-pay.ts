import { apiGet } from './client';
import type { BankPayMerchant } from '@/lib/bank-pay/types';

type LookupResponse = {
  found: boolean;
  code?: string;
  name?: string;
  orgId?: string;
};

export async function lookupMerchantApi(code: string): Promise<BankPayMerchant | null> {
  try {
    const res = await apiGet<LookupResponse>(
      `/merchant/lookup/${encodeURIComponent(code.trim().toUpperCase())}`,
    );
    if (!res.found || !res.code || !res.name) return null;
    return { code: res.code, name: res.name };
  } catch {
    return null;
  }
}

export async function payMerchantApi(input: {
  merchantCode: string;
  amountRwf: number;
  beneficiaryLabel?: string;
  memo?: string;
}) {
  const { apiPostAuth } = await import('./client');
  return apiPostAuth<{
    merchant: { code: string; name: string };
    amountRwf: number;
    txHash: string;
    queueId: string;
    estimatedSeconds: number;
  }>('/payments/bank-pay/pay', input);
}

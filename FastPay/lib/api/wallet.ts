import { apiGetAuth } from './client';

export type WalletMeResponse = {
  id: string;
  accountNumber: string;
  publicKey: string;
  balance: number;
  currency: string;
  balances: Record<string, string>;
  xlmBalance: number;
};

export async function fetchWalletMe(): Promise<WalletMeResponse> {
  return apiGetAuth<WalletMeResponse>('/wallet/me');
}

export async function fetchWalletHistory() {
  return apiGetAuth<
    Array<{
      id: string;
      txHash: string;
      status: string;
      amount: string;
      asset: string;
      direction: 'in' | 'out';
      counterparty: string;
      createdAt: string;
    }>
  >('/wallet/me/history');
}

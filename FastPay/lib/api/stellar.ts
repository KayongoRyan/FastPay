import { apiGet } from "./client";

import type { StellarBalanceEntry } from "@/lib/stellar/types";

export async function fetchAccountBalances(
  publicKey: string,
): Promise<StellarBalanceEntry[]> {
  return apiGet<StellarBalanceEntry[]>(
    `/stellar/accounts/${encodeURIComponent(publicKey)}/balance`,
  );
}

export interface PaymentHistoryItem {
  id: string;
  txHash: string;
  status: string;
  amount: string;
  asset: string;
  direction: "in" | "out";
  counterparty: string;
  createdAt: string;
}

export async function fetchPaymentHistory(
  publicKey: string,
): Promise<PaymentHistoryItem[]> {
  return apiGet<PaymentHistoryItem[]>(
    `/payments/history/${encodeURIComponent(publicKey)}`,
  );
}

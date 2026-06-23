import { Account } from "@/lib/stellar/sdk";

import { STELLAR_HORIZON_URL } from "./constants";

interface HorizonAccountResponse {
  sequence: string;
}

interface HorizonFeeStatsResponse {
  last_ledger_base_fee?: string;
  fee_charged?: { mode?: string };
}

function horizonBase(): string {
  return STELLAR_HORIZON_URL.replace(/\/$/, "");
}

export async function loadHorizonAccount(publicKey: string): Promise<Account> {
  const response = await fetch(`${horizonBase()}/accounts/${publicKey}`);

  if (!response.ok) {
    throw new Error(`Failed to load Stellar account (${response.status})`);
  }

  const data = (await response.json()) as HorizonAccountResponse;
  return new Account(publicKey, data.sequence);
}

export async function fetchHorizonBaseFee(): Promise<string> {
  try {
    const response = await fetch(`${horizonBase()}/fee_stats`);
    if (!response.ok) {
      return "100";
    }

    const data = (await response.json()) as HorizonFeeStatsResponse;
    return data.fee_charged?.mode ?? data.last_ledger_base_fee ?? "100";
  } catch {
    return "100";
  }
}

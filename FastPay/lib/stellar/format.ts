import type { PaymentHistoryItem } from "@/lib/api/stellar";
import type { StellarBalanceEntry, WalletTransaction } from "@/lib/stellar/types";

/** Demo FX for displaying RWF equivalent on Home. */
const XLM_TO_RWF = 1_500;

export function getNativeBalance(balances: StellarBalanceEntry[]): number {
  const native = balances.find((entry) => entry.assetType === "native");
  return native ? Number(native.balance) : 0;
}

export function formatXlmBalance(amount: number): string {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  });
}

export function formatRwfEstimateFromXlm(xlm: number): string {
  return Math.round(xlm * XLM_TO_RWF).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });
}

export function formatTxDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).replace(/\//g, " ");
}

export function mapPaymentToTransaction(
  payment: PaymentHistoryItem,
): WalletTransaction {
  const amountNum = Number(payment.amount);
  const prefix = payment.direction === "out" ? "-" : "+";

  return {
    id: payment.id,
    title:
      payment.direction === "out"
        ? `Sent to ${shortAddress(payment.counterparty)}`
        : `Received from ${shortAddress(payment.counterparty)}`,
    date: formatTxDate(payment.createdAt),
    amount: `${prefix}${amountNum.toLocaleString(undefined, { maximumFractionDigits: 7 })} ${payment.asset}`,
    asset: payment.asset,
    direction: payment.direction,
    counterparty: payment.counterparty,
  };
}

function shortAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

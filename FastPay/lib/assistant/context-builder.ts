import type { BudgetSnapshotPayload } from "@/lib/api/chat";
import type { AuthUser } from "@/lib/auth/types";

import type { AssistantContext } from "./types";

export function buildAssistantContext(params: {
  currentRoute?: string;
  screenTitle?: string;
  walletPublicKey?: string;
  walletBalanceXlm?: number;
  walletBalanceRwf?: string;
  walletBalanceUsdt?: string;
  cryptoPortfolioSummary?: string;
  engagementSummary?: string;
  budgetSnapshot?: BudgetSnapshotPayload;
  user?: AuthUser | null;
}): AssistantContext {
  return {
    currentRoute: params.currentRoute,
    screenTitle: params.screenTitle ?? "Ask FastPay",
    walletPublicKey: params.walletPublicKey,
    walletBalanceXlm: params.walletBalanceXlm,
    walletBalanceRwf: params.walletBalanceRwf,
    walletBalanceUsdt: params.walletBalanceUsdt,
    cryptoPortfolioSummary: params.cryptoPortfolioSummary,
    engagementSummary: params.engagementSummary,
    budgetSnapshot: params.budgetSnapshot,
    user: params.user ?? null,
  };
}

export function contextToPromptSection(context: AssistantContext): string {
  const lines: string[] = [];

  if (context.currentRoute) {
    lines.push(`Current screen: ${context.currentRoute}`);
  }
  if (context.user?.fullName) {
    lines.push(`User: ${context.user.fullName}`);
  }
  if (context.user?.kycStatus) {
    lines.push(`KYC: ${context.user.kycStatus} (level ${context.user.kycLevel})`);
  }
  if (context.walletPublicKey) {
    lines.push(`Wallet: ${context.walletPublicKey}`);
  }
  if (context.walletBalanceRwf) {
    lines.push(`Balance estimate: ${context.walletBalanceRwf} RWF`);
  }
  if (context.walletBalanceUsdt) {
    lines.push(`Crypto balance: ${context.walletBalanceUsdt} USDT equivalent`);
  }
  if (context.cryptoPortfolioSummary) {
    lines.push(`Portfolio: ${context.cryptoPortfolioSummary}`);
  }
  if (context.engagementSummary) {
    lines.push(`User engagement:\n${context.engagementSummary}`);
  }
  if (context.budgetSnapshot) {
    lines.push(`Budget snapshot: ${JSON.stringify(context.budgetSnapshot)}`);
  }

  return lines.join("\n");
}

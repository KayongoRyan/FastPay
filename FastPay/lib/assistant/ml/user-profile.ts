import type { AssistantContext, UserProfile } from "../types";

import { HIGH_SPEND_PERCENT, LOW_SAVINGS_PERCENT } from "./config";

function parseTopIntents(engagementSummary?: string): string[] {
  if (!engagementSummary) {
    return [];
  }
  const lower = engagementSummary.toLowerCase();
  const known = [
    "navigate",
    "balance",
    "budget",
    "cash_flow",
    "planning",
    "kyc",
    "passcode",
    "product_help",
    "external_info",
    "general",
  ];
  return known
    .filter((i) => lower.includes(i.replace("_", " ")) || lower.includes(i))
    .slice(0, 5);
}

function loanInterestSignal(
  intents: string[],
  engagementSummary?: string,
): boolean {
  const blob = [...intents, engagementSummary ?? ""].join(" ").toLowerCase();
  return (
    blob.includes("product_help") &&
    (blob.includes("loan") || blob.includes("borrow") || blob.includes("credit"))
  );
}

export function buildUserProfile(
  context: AssistantContext,
  routeVisitCounts?: Record<string, number>,
): UserProfile {
  const budget = context.budgetSnapshot;
  const income = budget?.monthlyIncomeRwf;
  const spend = budget?.spendPercent;
  const savings = budget?.savingsPercent;
  const intents = parseTopIntents(context.engagementSummary);
  const visits = routeVisitCounts ?? {};

  const riskFlags: string[] = [];
  if (spend != null && spend > HIGH_SPEND_PERCENT) {
    riskFlags.push("high_spend");
  }
  if (savings != null && savings < LOW_SAVINGS_PERCENT) {
    riskFlags.push("low_savings");
  }
  if (loanInterestSignal(intents, context.engagementSummary)) {
    riskFlags.push("loan_interest");
  }

  const portfolio = context.cryptoPortfolioSummary ?? "USDT/BTC/SOL";
  const summaryChunk = [
    `income: ${income ?? "?"} RWF`,
    `spend: ${spend ?? "?"}%`,
    `savings: ${savings ?? "?"}%`,
    `topIntents: [${intents.join(", ")}]`,
    `portfolio: ${portfolio}`,
    `riskFlags: [${riskFlags.join(", ")}]`,
  ].join(" | ");

  return {
    incomeRwf: income,
    spendPercent: spend,
    savingsPercent: savings,
    topIntents: intents,
    portfolio,
    riskFlags,
    routeVisitCounts: visits,
    summaryChunk,
  };
}

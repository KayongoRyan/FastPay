import type { ChatAction } from "@/lib/api/chat";

import type { AssistantIntent, UserProfile } from "../types";

import {
  INTENT_MATCH_BOOST,
  RISK_FLAG_BOOST,
  ROUTE_VISIT_PENALTY,
  ROUTE_VISIT_PENALTY_AFTER,
} from "./config";

const INTENT_ROUTES: Partial<
  Record<AssistantIntent, { label: string; href: string }[]>
> = {
  balance: [{ label: "Open Wallet", href: "/wallet" }],
  cash_flow: [{ label: "Review cash flow", href: "/analytics" }],
  planning: [
    { label: "Open Analytics", href: "/analytics" },
    { label: "Add funds", href: "/buy" },
  ],
  budget: [{ label: "View goals", href: "/analytics?mode=goals" }],
  kyc: [{ label: "Complete KYC", href: "/(auth)/kyc" }],
  passcode: [{ label: "Reset passcode", href: "/forgot-passcode" }],
  product_help: [
    { label: "Open Bills", href: "/bills" },
    { label: "Transfer", href: "/wallet/transfer" },
  ],
  general: [{ label: "Open Support", href: "/support" }],
  external_info: [{ label: "Open Settings", href: "/settings" }],
};

const RISK_ACTIONS: Record<string, { label: string; href: string }[]> = {
  high_spend: [{ label: "Review Analytics", href: "/analytics" }],
  low_savings: [
    { label: "Set savings goal", href: "/analytics?mode=goals" },
    { label: "Add funds", href: "/buy" },
  ],
  loan_interest: [{ label: "Loan info", href: "/loan/apply" }],
};

function routesMatch(a: string, b: string): boolean {
  return a === b || a.split("?")[0] === b.split("?")[0];
}

export function dedupeActions(actions: ChatAction[]): ChatAction[] {
  const seen = new Set<string>();
  return actions.filter((action) => {
    if (seen.has(action.href)) {
      return false;
    }
    seen.add(action.href);
    return true;
  });
}

export function rankActions(
  intent: AssistantIntent,
  profile: UserProfile | undefined,
  candidates: ChatAction[] = [],
  topN = 2,
): ChatAction[] {
  const visits = profile?.routeVisitCounts ?? {};
  const pool: ChatAction[] = [...candidates];

  for (const route of INTENT_ROUTES[intent] ?? []) {
    pool.push(route);
  }

  if (profile) {
    for (const flag of profile.riskFlags) {
      if (flag === "loan_interest" && profile.riskFlags.includes("low_savings")) {
        if (intent !== "product_help") {
          continue;
        }
      }
      for (const route of RISK_ACTIONS[flag] ?? []) {
        if (
          route.href === "/loan/apply" &&
          profile.riskFlags.includes("low_savings")
        ) {
          continue;
        }
        pool.push(route);
      }
    }
  }

  const preferred = new Set(
    (INTENT_ROUTES[intent] ?? []).map((r) => r.href),
  );

  const scored = dedupeActions(pool).map((action) => {
    let score = 0;
    if ([...preferred].some((p) => routesMatch(action.href, p))) {
      score += INTENT_MATCH_BOOST;
    }

    if (profile) {
      const matchedFlags = new Set<string>();
      for (const flag of profile.riskFlags) {
        const flagHrefs = new Set(
          (RISK_ACTIONS[flag] ?? []).map((r) => r.href),
        );
        if (flagHrefs.has(action.href)) {
          matchedFlags.add(flag);
        }
      }
      score += RISK_FLAG_BOOST * matchedFlags.size;

      const count =
        visits[action.href] ?? visits[action.href.split("?")[0]] ?? 0;
      if (count >= ROUTE_VISIT_PENALTY_AFTER) {
        score -= ROUTE_VISIT_PENALTY;
      }
    }

    return { action, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN).map((s) => s.action);
}

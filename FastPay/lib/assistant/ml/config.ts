import type { AssistantIntent } from "../types";

/** Keep in sync with fastpay-assistant-ml/fastpay_assistant/ml/config.py */

export const RETRIEVAL_HIGH = 0.8;
export const RETRIEVAL_LOW = 0.35;
export const SCORE_GAP_MIN = 0.1;

export const INTENT_CENTROID_MIN = 0.55;
export const REGEX_CONFIDENCE = 0.75;
export const GENERAL_CONFIDENCE = 0.3;

export const CLOUD_ESCALATION_THRESHOLD = 0.55;
export const REFUSAL_CONFIDENCE = 0.4;

export const MONEY_INTENTS: ReadonlySet<AssistantIntent> = new Set([
  "balance",
  "cash_flow",
  "planning",
  "budget",
]);

export const CLOUD_PREFERRED_INTENTS: ReadonlySet<AssistantIntent> = new Set([
  "general",
  "product_help",
]);

export const HIGH_SPEND_PERCENT = 70;
export const LOW_SAVINGS_PERCENT = 10;

export const INTENT_MATCH_BOOST = 3;
export const RISK_FLAG_BOOST = 2;
export const ROUTE_VISIT_PENALTY_AFTER = 5;
export const ROUTE_VISIT_PENALTY = 1;

export const ALLOWED_HREFS = new Set([
  "/wallet",
  "/wallet/transfer",
  "/wallet/receive",
  "/buy",
  "/bills",
  "/analytics",
  "/analytics?mode=goals",
  "/settings",
  "/support",
  "/(auth)/kyc",
  "/forgot-passcode",
  "/loan/apply",
  "/irembo",
  "/offline/receive",
  "/services/family-setup",
  "/services/family-wallet",
  "/services/bill",
  "/services/escrow",
  "/services/insurance-plans",
  "/services/voucher",
  "/convert",
  "/bank-pay",
  "/login",
]);

export const SAFE_NAV_ACTIONS = [
  { label: "Open Wallet", href: "/wallet" },
  { label: "Open Support", href: "/support" },
  { label: "Open Analytics", href: "/analytics" },
] as const;

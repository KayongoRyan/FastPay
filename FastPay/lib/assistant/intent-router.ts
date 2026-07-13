import type { AssistantIntent } from "./types";

const PATTERNS: { intent: AssistantIntent; regex: RegExp }[] = [
  {
    intent: "navigate",
    regex:
      /\b(go to|open|take me to|navigate|show me|where is|how do i (open|find|get to))\b/i,
  },
  {
    intent: "balance",
    regex:
      /\b(balance|how much (do i|money)|wallet address|public key|usdt|btc|bitcoin|sol|solana)\b/i,
  },
  {
    intent: "cash_flow",
    regex:
      /\b(cash flow|cashflow|spending|expenses|income|afford|overspend|burn rate|where (did|does) my money)\b/i,
  },
  {
    intent: "planning",
    regex:
      /\b(plan|budget plan|financial plan|save more|savings plan|money management|how should i|advice|direction|guide me)\b/i,
  },
  {
    intent: "budget",
    regex:
      /\b(budget|savings goal|saved toward|spend percent|family plan|analytics)\b/i,
  },
  {
    intent: "kyc",
    regex: /\b(kyc|verify|identity|national id|proof of address|verification)\b/i,
  },
  {
    intent: "passcode",
    regex: /\b(passcode|pin|transaction pin|forgot passcode|reset passcode)\b/i,
  },
  {
    intent: "external_info",
    regex:
      /\b(exchange rate|forex|usd|eur|rra|irembo|tax|government|horizon|stellar network|news|weather|outside)\b/i,
  },
];

export function classifyIntent(message: string): AssistantIntent {
  const normalized = message.trim().toLowerCase();
  if (!normalized) {
    return "general";
  }

  for (const { intent, regex } of PATTERNS) {
    if (regex.test(normalized)) {
      return intent;
    }
  }

  if (
    /\b(bill|transfer|loan|momo|airtime|escrow|insurance|offline|buy|convert)\b/i.test(
      normalized,
    )
  ) {
    return "product_help";
  }

  return "general";
}

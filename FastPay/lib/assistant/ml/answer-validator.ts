import type { ChatAction } from "@/lib/api/chat";

import type { AssistantContext, AssistantReply } from "../types";

import { ALLOWED_HREFS, REFUSAL_CONFIDENCE, SAFE_NAV_ACTIONS } from "./config";

const BALANCE_RE = /\b(balance|rwf|usdt|holdings|portfolio)\b/i;

function hrefAllowed(href: string): boolean {
  if (ALLOWED_HREFS.has(href)) {
    return true;
  }
  const base = href.split("?")[0];
  if (ALLOWED_HREFS.has(base)) {
    return true;
  }
  if (!href.startsWith("/")) {
    return false;
  }
  const root = base.split("/").filter(Boolean)[0];
  return [
    "wallet",
    "buy",
    "bills",
    "analytics",
    "settings",
    "support",
    "loan",
    "irembo",
    "offline",
    "services",
    "convert",
    "bank-pay",
    "forgot-passcode",
    "(auth)",
    "login",
  ].includes(root);
}

export function validateAnswer(
  reply: AssistantReply,
  context: AssistantContext,
  options: { corpusWasRetrieved?: boolean } = {},
): AssistantReply {
  const reasons: string[] = [];
  let confidence = reply.confidence ?? 0.75;
  let downgraded = false;
  let stripped = 0;
  let text = reply.reply;
  let actions = [...reply.actions];
  let sources = [...reply.sources];
  let refused = false;
  let needsEscalation = reply.needsEscalation;

  if (
    BALANCE_RE.test(text) &&
    !context.walletBalanceRwf &&
    !context.walletBalanceUsdt
  ) {
    if (
      /\d/.test(text) ||
      /estimated balance/i.test(text) ||
      /portfolio:/i.test(text)
    ) {
      text =
        "Open Wallet to refresh your balance — I don't have a current figure yet.";
      sources = [{ title: "Wallet", source: "local/wallet", route: "/wallet" }];
      actions = [{ label: "Open Wallet", href: "/wallet" }];
      reasons.push("balance_guard");
      confidence = Math.min(confidence, 0.5);
    }
  }

  const kept: ChatAction[] = [];
  for (const action of actions) {
    if (hrefAllowed(action.href)) {
      kept.push(action);
    } else {
      stripped += 1;
      reasons.push(`stripped_action:${action.href}`);
    }
  }
  actions = kept;

  if (options.corpusWasRetrieved && !sources.length && !reply.usedLlm) {
    confidence *= 0.6;
    downgraded = true;
    reasons.push("ungrounded_template");
  }

  if (confidence < REFUSAL_CONFIDENCE) {
    text =
      "I'm not sure I have a reliable answer for that. Try rephrasing, or open one of these screens.";
    sources = [{ title: "Support", source: "local/refusal" }];
    actions = SAFE_NAV_ACTIONS.map((a) => ({ ...a }));
    confidence = Math.min(confidence, REFUSAL_CONFIDENCE - 0.01);
    refused = true;
    needsEscalation = true;
    reasons.push("low_confidence_refusal");
  }

  return {
    ...reply,
    reply: text,
    sources,
    actions,
    confidence,
    needsEscalation,
    validation: {
      ok: !refused && stripped === 0 && !downgraded,
      reasons,
      downgradedConfidence: downgraded,
      strippedActions: stripped,
      refused,
    },
  };
}

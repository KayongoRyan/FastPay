import type { AssistantContext, ToolFetchResult } from "../types";
import { canUseExternalTools } from "../privacy";
import type { AssistantPrivacyMode } from "../types";

import { fetchBundledFaq } from "./bundled-faq";
import { fetchFxRates } from "./fx-rates";
import { fetchStellarLookup } from "./stellar-lookup";

export interface ToolDefinition {
  id: string;
  description: string;
  match: RegExp;
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    id: "fx_rates",
    description: "Live USD/EUR to RWF exchange rates",
    match: /\b(exchange rate|forex|usd|eur|dollar|euro|rwf rate)\b/i,
  },
  {
    id: "stellar_lookup",
    description: "Stellar account balance or public network lookup",
    match: /\b(stellar|horizon|G[A-Z0-9]{55}|account balance on chain)\b/i,
  },
  {
    id: "bundled_faq",
    description: "Irembo, RRA, and government service FAQs",
    match: /\b(irembo|rra|tax|national id|birth certificate|government service)\b/i,
  },
];

export function selectTools(message: string): ToolDefinition[] {
  return TOOL_DEFINITIONS.filter((tool) => tool.match.test(message));
}

export async function runTools(params: {
  message: string;
  mode: AssistantPrivacyMode;
  context: AssistantContext;
}): Promise<ToolFetchResult[]> {
  if (!canUseExternalTools(params.mode)) {
    return [];
  }

  const selected = selectTools(params.message);
  const results: ToolFetchResult[] = [];

  for (const tool of selected) {
    try {
      if (tool.id === "fx_rates") {
        const fx = await fetchFxRates();
        if (fx) {
          results.push(fx);
        }
      } else if (tool.id === "stellar_lookup") {
        const stellar = await fetchStellarLookup(params.message, params.context);
        if (stellar) {
          results.push(stellar);
        }
      } else if (tool.id === "bundled_faq") {
        const faq = fetchBundledFaq(params.message);
        if (faq) {
          results.push(faq);
        }
      }
    } catch {
      // Skip failed tools; local RAG still answers.
    }
  }

  return results;
}

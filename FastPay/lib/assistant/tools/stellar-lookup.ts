import type { AssistantContext, ToolFetchResult } from "../types";
import { redactForExternalFetch } from "../privacy";

const STELLAR_KEY_REGEX = /G[A-Z2-7]{55}/;

async function fetchWithTimeout(url: string, timeoutMs = 6000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function extractStellarKey(message: string, context: AssistantContext): string | null {
  const match = message.match(STELLAR_KEY_REGEX);
  if (match) {
    return match[0];
  }
  return context.walletPublicKey ?? null;
}

export async function fetchStellarLookup(
  message: string,
  context: AssistantContext,
): Promise<ToolFetchResult | null> {
  const publicKey = extractStellarKey(redactForExternalFetch(message), context);
  if (!publicKey) {
    return null;
  }

  try {
    const response = await fetchWithTimeout(
      `https://horizon.stellar.org/accounts/${encodeURIComponent(publicKey)}`,
      6000,
    );

    if (!response.ok) {
      return {
        toolId: "stellar_lookup",
        title: "Stellar account",
        snippets: [`Account ${publicKey} was not found on the public network.`],
      };
    }

    const body = (await response.json()) as {
      balances?: { balance: string; asset_type: string }[];
    };

    const balances =
      body.balances
        ?.slice(0, 4)
        .map((b) => `${b.balance} ${b.asset_type === "native" ? "XLM" : b.asset_type}`)
        .join(", ") ?? "No balances";

    return {
      toolId: "stellar_lookup",
      title: "Stellar Horizon",
      snippets: [`Account ${publicKey}: ${balances}`],
    };
  } catch {
    return {
      toolId: "stellar_lookup",
      title: "Stellar Horizon",
      snippets: [
        `Could not reach Horizon for ${publicKey}. Try again when online.`,
      ],
    };
  }
}

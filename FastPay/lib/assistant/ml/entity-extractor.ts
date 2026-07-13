import type { ExtractedEntities } from "../types";

const AMOUNT_RE =
  /(?:rwf\s*)?(\d{1,3}(?:,\d{3})+|\d{4,}|\d+)(?:\s*(?:rwf|frw))?/gi;
const ASSET_RE = /\b(usdt|btc|bitcoin|sol|solana)\b/i;
const TIMEFRAME_RE =
  /\b(today|this week|this month|last month|weekly|monthly|yearly|this year)\b/i;
const ACTION_RE = /\b(transfer|send|save|savings|loan|borrow)\b/i;

const ASSET_MAP: Record<string, ExtractedEntities["asset"]> = {
  usdt: "USDT",
  btc: "BTC",
  bitcoin: "BTC",
  sol: "SOL",
  solana: "SOL",
};

const ACTION_MAP: Record<string, ExtractedEntities["action"]> = {
  transfer: "transfer",
  send: "transfer",
  save: "save",
  savings: "save",
  loan: "loan",
  borrow: "loan",
};

export function extractEntities(message: string): ExtractedEntities {
  let amountRwf: number | undefined;

  for (const match of message.matchAll(AMOUNT_RE)) {
    const raw = match[1].replace(/,/g, "");
    const value = Number(raw);
    if (Number.isNaN(value)) {
      continue;
    }
    const span = message
      .slice(Math.max(0, match.index! - 4), match.index! + match[0].length + 4)
      .toLowerCase();
    if (value < 100 && !span.includes("rwf") && !span.includes("frw")) {
      continue;
    }
    amountRwf = value;
    break;
  }

  const assetMatch = message.match(ASSET_RE);
  const asset = assetMatch ? ASSET_MAP[assetMatch[1].toLowerCase()] : undefined;

  const timeframeMatch = message.match(TIMEFRAME_RE);
  const timeframe = timeframeMatch?.[1].toLowerCase();

  const actionMatch = message.match(ACTION_RE);
  const action = actionMatch
    ? ACTION_MAP[actionMatch[1].toLowerCase()]
    : undefined;

  return { amountRwf, asset, timeframe, action };
}

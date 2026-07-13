import type { RetrievedLocalChunk } from "../types";
import type { BudgetSnapshotPayload } from "@/lib/api/chat";

export function buildSystemPrompt(): string {
  return [
    "You are FastPay Assistant, a helpful support agent for the FastPay fintech wallet in Rwanda.",
    "Answer ONLY using the provided context chunks. If context is insufficient, say you are not sure.",
    "Never invent fees, exchange rates, balances, or account details.",
    "Do not provide regulated financial advice; include a brief disclaimer when discussing savings or loans.",
    "Return valid JSON with keys: reply (string), sources (array of {title, source, route?}), actions (array of {label, href}).",
    "Only suggest actions when a matching route exists in context.",
  ].join(" ");
}

export function buildUserPrompt(params: {
  message: string;
  chunks: RetrievedLocalChunk[];
  toolSnippets?: string[];
  budgetSnapshot?: BudgetSnapshotPayload;
  currentRoute?: string;
}): string {
  const context = params.chunks
    .map(
      (chunk, index) =>
        `[${index + 1}] title=${chunk.title ?? "Untitled"} source=${chunk.source} route=${chunk.route ?? ""}\n${chunk.text}`,
    )
    .join("\n\n");

  const toolSection = params.toolSnippets?.length
    ? `\n\nExternal tool results:\n${params.toolSnippets.join("\n\n")}`
    : "";

  const budgetSection = params.budgetSnapshot
    ? `\n\nUser budget snapshot:\n${JSON.stringify(params.budgetSnapshot, null, 2)}`
    : "";

  return [
    `User question: ${params.message}`,
    params.currentRoute ? `Current screen: ${params.currentRoute}` : "",
    "Context chunks:",
    context || "(no context retrieved)",
    toolSection,
    budgetSection,
    "Respond in JSON only.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function parseLlmJson(content: string): {
  reply: string;
  sources: { title: string; source: string; route?: string }[];
  actions: { label: string; href: string }[];
} {
  try {
    const parsed = JSON.parse(content) as {
      reply?: string;
      sources?: { title: string; source: string; route?: string }[];
      actions?: { label: string; href: string }[];
    };
    return {
      reply:
        parsed.reply ??
        "I could not generate a response. Try asking about a specific FastPay feature.",
      sources: parsed.sources ?? [],
      actions: parsed.actions ?? [],
    };
  } catch {
    return {
      reply: content.trim() || "I could not parse the model response.",
      sources: [],
      actions: [],
    };
  }
}

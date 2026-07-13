import type { RetrievedLocalChunk } from "../types";

function dedupeActions(
  actions: { label: string; href: string }[],
): { label: string; href: string }[] {
  const seen = new Set<string>();
  return actions.filter((action) => {
    if (seen.has(action.href)) {
      return false;
    }
    seen.add(action.href);
    return true;
  });
}

export function chunksToTemplateReply(chunks: RetrievedLocalChunk[]): {
  reply: string;
  sources: { title: string; source: string; route?: string }[];
  actions: { label: string; href: string }[];
} {
  const top = chunks.slice(0, 3);

  if (!top.length) {
    return {
      reply:
        "I could not find FastPay docs for that. Try asking about transfers, bills, savings, loans, or KYC.",
      sources: [],
      actions: [],
    };
  }

  const lines = top.map(
    (chunk) => `• ${chunk.title ?? chunk.source}: ${chunk.text.slice(0, 220)}…`,
  );

  return {
    reply: ["Here is what I found in FastPay:", ...lines, "", "This is product guidance, not personal financial advice."].join(
      "\n",
    ),
    sources: top.map((chunk) => ({
      title: chunk.title ?? chunk.source,
      source: chunk.source,
      route: chunk.route,
    })),
    actions: dedupeActions(
      top
        .filter((chunk) => chunk.route || chunk.actionRoute)
        .slice(0, 2)
        .map((chunk) => ({
          label: `Open ${chunk.title ?? "screen"}`,
          href: chunk.actionRoute ?? chunk.route!,
        })),
    ),
  };
}

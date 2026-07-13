import externalFaq from "@/assets/corpus/external-faq.json";

import type { ToolFetchResult } from "../types";

interface FaqEntry {
  title: string;
  keywords: string[];
  text: string;
}

const ENTRIES = externalFaq as FaqEntry[];

export function fetchBundledFaq(message: string): ToolFetchResult | null {
  const lower = message.toLowerCase();
  const matches = ENTRIES.filter((entry) =>
    entry.keywords.some((kw) => lower.includes(kw.toLowerCase())),
  );

  if (!matches.length) {
    return null;
  }

  return {
    toolId: "bundled_faq",
    title: "Rwanda public services FAQ",
    snippets: matches.slice(0, 3).map((m) => `${m.title}: ${m.text}`),
  };
}

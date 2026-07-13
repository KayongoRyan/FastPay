import { tokenize } from "../local-rag/bm25";
import type { AssistantIntent, IntentResult } from "../types";

import { INTENT_CENTROID_MIN } from "./config";
import { INTENT_EXEMPLARS } from "./intent-exemplars";

function tokenOverlap(a: string[], b: string[]): number {
  if (!a.length || !b.length) {
    return 0;
  }
  const aSet = new Set(a);
  const bSet = new Set(b);
  let intersection = 0;
  for (const t of aSet) {
    if (bSet.has(t)) {
      intersection += 1;
    }
  }
  return intersection / (aSet.size + bSet.size - intersection);
}

function cosineTfidf(aTokens: string[], bTokens: string[]): number {
  const aTf = new Map<string, number>();
  const bTf = new Map<string, number>();
  for (const t of aTokens) {
    aTf.set(t, (aTf.get(t) ?? 0) + 1);
  }
  for (const t of bTokens) {
    bTf.set(t, (bTf.get(t) ?? 0) + 1);
  }

  const vocab = new Set([...aTf.keys(), ...bTf.keys()]);
  let dot = 0;
  let na = 0;
  let nb = 0;

  for (const term of vocab) {
    const aw = aTf.get(term) ?? 0;
    const bw = bTf.get(term) ?? 0;
    dot += aw * bw;
    na += aw * aw;
    nb += bw * bw;
  }

  if (na === 0 || nb === 0) {
    return 0;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function classifyIntentCentroid(message: string): IntentResult {
  const tokens = tokenize(message);
  if (!tokens.length) {
    return { intent: "general", confidence: 0, method: "centroid" };
  }

  let bestIntent: AssistantIntent = "general";
  let bestScore = 0;

  for (const [intent, phrases] of Object.entries(INTENT_EXEMPLARS) as [
    AssistantIntent,
    string[],
  ][]) {
    for (const phrase of phrases) {
      const exTokens = tokenize(phrase);
      const overlap = tokenOverlap(tokens, exTokens);
      const cosine = cosineTfidf(tokens, exTokens);
      const score = 0.55 * cosine + 0.45 * overlap;
      if (score > bestScore) {
        bestScore = score;
        bestIntent = intent;
      }
    }
  }

  return {
    intent: bestIntent,
    confidence: Math.min(1, bestScore),
    method: "centroid",
  };
}

export function shouldUseCentroid(result: IntentResult): boolean {
  return result.confidence >= INTENT_CENTROID_MIN;
}

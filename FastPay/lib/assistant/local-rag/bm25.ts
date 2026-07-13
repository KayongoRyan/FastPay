const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "is",
  "are",
  "was",
  "were",
  "to",
  "for",
  "of",
  "in",
  "on",
  "at",
  "my",
  "me",
  "i",
  "how",
  "what",
  "where",
  "can",
  "do",
  "does",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

export function termFrequency(tokens: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const token of tokens) {
    freq.set(token, (freq.get(token) ?? 0) + 1);
  }
  return freq;
}

/** Okapi BM25-lite without external deps. */
export function bm25Score(
  queryTokens: string[],
  docTokens: string[],
  docLength: number,
  avgDocLength: number,
  docFreq: Map<string, number>,
  totalDocs: number,
  k1 = 1.2,
  b = 0.75,
): number {
  const tf = termFrequency(docTokens);
  let score = 0;

  for (const term of queryTokens) {
    const freq = tf.get(term) ?? 0;
    if (freq === 0) {
      continue;
    }

    const df = docFreq.get(term) ?? 0;
    const idf = Math.log(1 + (totalDocs - df + 0.5) / (df + 0.5));
    const numerator = freq * (k1 + 1);
    const denominator =
      freq + k1 * (1 - b + (b * docLength) / Math.max(avgDocLength, 1));
    score += idf * (numerator / denominator);
  }

  return score;
}

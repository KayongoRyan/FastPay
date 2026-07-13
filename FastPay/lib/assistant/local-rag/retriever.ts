import localCorpus from "@/assets/corpus/local-corpus.json";

import { bm25Score, tokenize } from "./bm25";
import type { LocalCorpusChunk, RetrievedLocalChunk } from "../types";

type IndexedDoc = LocalCorpusChunk & {
  tokens: string[];
  docLength: number;
};

let indexed: IndexedDoc[] | null = null;
let docFreq: Map<string, number> | null = null;
let avgDocLength = 0;

function ensureIndex(): IndexedDoc[] {
  if (indexed) {
    return indexed;
  }

  const chunks = localCorpus as LocalCorpusChunk[];
  indexed = chunks.map((chunk) => {
    const text = `${chunk.title ?? ""} ${chunk.text ?? ""} ${chunk.route ?? ""}`;
    const tokens = tokenize(text);
    return { ...chunk, tokens, docLength: tokens.length };
  });

  docFreq = new Map();
  let totalLen = 0;
  for (const doc of indexed) {
    totalLen += doc.docLength;
    const seen = new Set(doc.tokens);
    for (const term of seen) {
      docFreq.set(term, (docFreq.get(term) ?? 0) + 1);
    }
  }

  avgDocLength = indexed.length ? totalLen / indexed.length : 0;
  return indexed;
}

export function retrieveLocalChunks(
  query: string,
  topK = 5,
  currentRoute?: string,
): RetrievedLocalChunk[] {
  const docs = ensureIndex();
  const df = docFreq ?? new Map();
  const queryTokens = tokenize(query);

  if (!queryTokens.length) {
    return [];
  }

  const scored = docs
    .map((doc) => {
      let score = bm25Score(
        queryTokens,
        doc.tokens,
        doc.docLength,
        avgDocLength,
        df,
        docs.length,
      );

      if (currentRoute && doc.route === currentRoute) {
        score += 0.5;
      }

      return { ...doc, score };
    })
    .filter((doc) => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored.map(({ tokens: _t, docLength: _d, score, ...chunk }) => ({
    ...chunk,
    score,
  }));
}

export function getCorpusChunkCount(): number {
  return ensureIndex().length;
}

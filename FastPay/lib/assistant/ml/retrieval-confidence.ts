import type { RetrievedLocalChunk, RetrievalMeta } from "../types";

import { RETRIEVAL_HIGH, RETRIEVAL_LOW, SCORE_GAP_MIN } from "./config";

export function normalizeScores(scores: number[]): number[] {
  if (!scores.length) {
    return [];
  }
  const peak = Math.max(...scores);
  if (peak <= 0) {
    return scores.map(() => 0);
  }
  return scores.map((s) => s / peak);
}

export function computeRetrievalMeta(
  chunks: RetrievedLocalChunk[],
): RetrievalMeta {
  if (!chunks.length) {
    return { maxScore: 0, scoreGap: 0, chunkCount: 0 };
  }

  const norm = normalizeScores(chunks.map((c) => c.score));
  const maxScore = norm[0] ?? 0;
  const scoreGap = norm.length > 1 ? norm[0] - norm[1] : maxScore;

  return {
    maxScore,
    scoreGap,
    chunkCount: chunks.length,
  };
}

export function retrievalConfidence(meta: RetrievalMeta): number {
  if (meta.chunkCount === 0) {
    return 0;
  }
  if (meta.maxScore >= RETRIEVAL_HIGH && meta.scoreGap >= SCORE_GAP_MIN) {
    return Math.min(1, 0.7 + 0.3 * meta.maxScore);
  }
  if (meta.maxScore >= RETRIEVAL_LOW) {
    return 0.4 + 0.3 * meta.maxScore;
  }
  return Math.max(0.05, meta.maxScore * 0.5);
}

export function isLowRetrieval(meta: RetrievalMeta): boolean {
  return meta.maxScore < RETRIEVAL_LOW;
}

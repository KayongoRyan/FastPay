from __future__ import annotations

from fastpay_assistant.ml.config import RETRIEVAL_HIGH, RETRIEVAL_LOW, SCORE_GAP_MIN
from fastpay_assistant.types import RetrievedLocalChunk, RetrievalMeta


def normalize_scores(scores: list[float]) -> list[float]:
    if not scores:
        return []
    peak = max(scores)
    if peak <= 0:
        return [0.0] * len(scores)
    return [s / peak for s in scores]


def compute_retrieval_meta(chunks: list[RetrievedLocalChunk]) -> RetrievalMeta:
    if not chunks:
        return RetrievalMeta(max_score=0.0, score_gap=0.0, chunk_count=0)

    raw = [c.score for c in chunks]
    norm = normalize_scores(raw)
    max_score = norm[0] if norm else 0.0
    score_gap = (norm[0] - norm[1]) if len(norm) > 1 else max_score
    return RetrievalMeta(
        max_score=max_score,
        score_gap=score_gap,
        chunk_count=len(chunks),
    )


def retrieval_confidence(meta: RetrievalMeta) -> float:
    """Map retrieval meta → [0, 1] confidence used in overall reply confidence."""
    if meta.chunk_count == 0:
        return 0.0
    if meta.max_score >= RETRIEVAL_HIGH and meta.score_gap >= SCORE_GAP_MIN:
        return min(1.0, 0.7 + 0.3 * meta.max_score)
    if meta.max_score >= RETRIEVAL_LOW:
        return 0.4 + 0.3 * meta.max_score
    return max(0.05, meta.max_score * 0.5)


def is_low_retrieval(meta: RetrievalMeta) -> bool:
    return meta.max_score < RETRIEVAL_LOW

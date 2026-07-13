from fastpay_assistant.ml.retrieval_confidence import (
    compute_retrieval_meta,
    is_low_retrieval,
    normalize_scores,
    retrieval_confidence,
)
from fastpay_assistant.types import RetrievedLocalChunk


def _chunk(score: float) -> RetrievedLocalChunk:
    return RetrievedLocalChunk(
        text="t",
        source="s",
        title="T",
        score=score,
    )


def test_normalize_scores():
    assert normalize_scores([4.0, 2.0, 1.0]) == [1.0, 0.5, 0.25]
    assert normalize_scores([]) == []


def test_meta_gap():
    meta = compute_retrieval_meta([_chunk(10), _chunk(5), _chunk(1)])
    assert meta.max_score == 1.0
    assert abs(meta.score_gap - 0.5) < 1e-9
    assert meta.chunk_count == 3


def test_low_retrieval():
    meta = compute_retrieval_meta([_chunk(0.1)])
    # normalized max is 1.0 for single chunk — gap/low uses normalized
    assert meta.max_score == 1.0
    low = compute_retrieval_meta([])
    assert is_low_retrieval(low)
    assert retrieval_confidence(low) == 0.0

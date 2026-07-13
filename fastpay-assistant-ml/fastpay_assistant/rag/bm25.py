from __future__ import annotations

import math
import re
from collections import Counter

STOP_WORDS = frozenset(
    {
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
    }
)

_TOKEN_RE = re.compile(r"[^a-z0-9\s]+")


def tokenize(text: str) -> list[str]:
    cleaned = _TOKEN_RE.sub(" ", text.lower())
    return [t for t in cleaned.split() if len(t) > 1 and t not in STOP_WORDS]


def term_frequency(tokens: list[str]) -> dict[str, int]:
    return dict(Counter(tokens))


def bm25_score(
    query_tokens: list[str],
    doc_tokens: list[str],
    doc_length: int,
    avg_doc_length: float,
    doc_freq: dict[str, int],
    total_docs: int,
    k1: float = 1.2,
    b: float = 0.75,
) -> float:
    tf = term_frequency(doc_tokens)
    score = 0.0
    for term in query_tokens:
        freq = tf.get(term, 0)
        if freq == 0:
            continue
        df = doc_freq.get(term, 0)
        idf = math.log(1 + (total_docs - df + 0.5) / (df + 0.5))
        numerator = freq * (k1 + 1)
        denominator = freq + k1 * (1 - b + (b * doc_length) / max(avg_doc_length, 1.0))
        score += idf * (numerator / denominator)
    return score


def cosine_tfidf(
    a_tokens: list[str],
    b_tokens: list[str],
    idf: dict[str, float] | None = None,
) -> float:
    """Lightweight TF-IDF cosine between two token lists."""
    a_tf = term_frequency(a_tokens)
    b_tf = term_frequency(b_tokens)
    vocab = set(a_tf) | set(b_tf)
    if not vocab:
        return 0.0

    def weight(term: str, tf: dict[str, int]) -> float:
        raw = float(tf.get(term, 0))
        if idf is None:
            return raw
        return raw * idf.get(term, 1.0)

    dot = sum(weight(t, a_tf) * weight(t, b_tf) for t in vocab)
    na = math.sqrt(sum(weight(t, a_tf) ** 2 for t in vocab))
    nb = math.sqrt(sum(weight(t, b_tf) ** 2 for t in vocab))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


def token_overlap(a_tokens: list[str], b_tokens: list[str]) -> float:
    if not a_tokens or not b_tokens:
        return 0.0
    a_set, b_set = set(a_tokens), set(b_tokens)
    return len(a_set & b_set) / len(a_set | b_set)

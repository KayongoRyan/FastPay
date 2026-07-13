from __future__ import annotations

from fastpay_assistant.ml.config import INTENT_CENTROID_MIN
from fastpay_assistant.ml.intent_exemplars import INTENT_EXEMPLARS
from fastpay_assistant.rag.bm25 import cosine_tfidf, tokenize, token_overlap
from fastpay_assistant.types import AssistantIntent, IntentResult


def classify_intent_centroid(message: str) -> IntentResult:
    tokens = tokenize(message)
    if not tokens:
        return IntentResult(
            intent=AssistantIntent.GENERAL,
            confidence=0.0,
            method="centroid",
        )

    best_intent = AssistantIntent.GENERAL
    best_score = 0.0

    for intent, phrases in INTENT_EXEMPLARS.items():
        for phrase in phrases:
            ex_tokens = tokenize(phrase)
            overlap = token_overlap(tokens, ex_tokens)
            cosine = cosine_tfidf(tokens, ex_tokens)
            score = 0.55 * cosine + 0.45 * overlap
            if score > best_score:
                best_score = score
                best_intent = intent

    return IntentResult(
        intent=best_intent,
        confidence=min(1.0, best_score),
        method="centroid",
    )


def should_use_centroid(result: IntentResult) -> bool:
    return result.confidence >= INTENT_CENTROID_MIN

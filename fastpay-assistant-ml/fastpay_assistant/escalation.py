from __future__ import annotations

from fastpay_assistant.ml.config import (
    CLOUD_ESCALATION_THRESHOLD,
    CLOUD_PREFERRED_INTENTS,
    RETRIEVAL_LOW,
)
from fastpay_assistant.types import AssistantPrivacyMode, AssistantReply, RetrievalMeta


def should_escalate_to_cloud(local_reply: AssistantReply) -> bool:
    """Connected-mode gate — replaces sources==0 && !usedLlm."""
    if local_reply.needs_escalation:
        return True
    if local_reply.confidence < CLOUD_ESCALATION_THRESHOLD:
        return True
    # Only apply retrieval threshold when retrieval actually ran
    if local_reply.retrieval is not None and local_reply.retrieval.max_score < RETRIEVAL_LOW:
        return True
    return False


def prefer_cloud_retrieval(
    intent_value: str,
    privacy_mode: AssistantPrivacyMode,
    is_online: bool,
    intent_confidence: float,
) -> bool:
    if privacy_mode != AssistantPrivacyMode.CONNECTED or not is_online:
        return False
    if intent_value in CLOUD_PREFERRED_INTENTS:
        return True
    return intent_confidence < CLOUD_ESCALATION_THRESHOLD


def combine_confidence(intent_confidence: float, retrieval: RetrievalMeta | None) -> float:
    if retrieval is None or retrieval.chunk_count == 0:
        return intent_confidence * 0.5
    from fastpay_assistant.ml.retrieval_confidence import retrieval_confidence

    return max(0.0, min(1.0, intent_confidence * retrieval_confidence(retrieval)))

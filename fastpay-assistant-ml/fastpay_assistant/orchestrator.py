from __future__ import annotations

import time

from fastpay_assistant.escalation import combine_confidence, should_escalate_to_cloud
from fastpay_assistant.fast_answers import try_fast_answer
from fastpay_assistant.feedback import TurnAuditStore
from fastpay_assistant.intent_router import classify_intent
from fastpay_assistant.ml.answer_validator import validate_answer
from fastpay_assistant.ml.config import MONEY_INTENTS, RETRIEVAL_LOW
from fastpay_assistant.ml.entity_extractor import extract_entities
from fastpay_assistant.ml.retrieval_confidence import compute_retrieval_meta, is_low_retrieval
from fastpay_assistant.ml.user_profile import build_user_profile
from fastpay_assistant.rag.retriever import LocalRetriever, retrieve_local_chunks
from fastpay_assistant.rag.template import chunks_to_template_reply
from fastpay_assistant.types import (
    AssistantIntent,
    AssistantPrivacyMode,
    AssistantQueryInput,
    AssistantReply,
    ChatAction,
    ChatSource,
    TurnAudit,
)


def run_assistant_query(
    input: AssistantQueryInput,
    *,
    retriever: LocalRetriever | None = None,
    audit_store: TurnAuditStore | None = None,
    llm_reply: AssistantReply | None = None,
) -> AssistantReply:
    """
    Confidence-gated orchestrator (Phases 1–3).

    llm_reply: optional injected local-LLM result (keeps package pure-Python / no native deps).
    """
    started = time.time()
    context = input.context

    # Phase 2: entities + Phase 3: profile
    context.extracted_entities = extract_entities(input.message)
    if context.user_profile is None:
        context.user_profile = build_user_profile(context)

    intent_result = classify_intent(input.message)
    intent = intent_result.intent

    # Grounded fast path for money intents when context present
    if intent.value in MONEY_INTENTS:
        fast = try_fast_answer(intent, input.message, context)
        if fast:
            fast.confidence = max(fast.confidence, intent_result.confidence)
            fast = validate_answer(fast, context, corpus_was_retrieved=False)
            _maybe_audit(audit_store, input.message, fast)
            return fast

    # Non-money fast answers (navigate/kyc/passcode)
    fast = try_fast_answer(intent, input.message, context)
    if fast:
        fast.confidence = max(fast.confidence, intent_result.confidence)
        fast = validate_answer(fast, context, corpus_was_retrieved=False)
        _maybe_audit(audit_store, input.message, fast)
        return fast

    if intent == AssistantIntent.EXTERNAL_INFO and input.privacy_mode == AssistantPrivacyMode.PRIVATE:
        reply = AssistantReply(
            reply=(
                "Live external lookups (FX, Horizon, government FAQs) require Connected mode. "
                "Switch in Settings → Assistant, or ask about FastPay features offline."
            ),
            sources=[ChatSource(title="Privacy", source="local/privacy")],
            actions=[ChatAction(label="Open Settings", href="/settings")],
            source="local",
            intent=intent,
            latency_ms=int((time.time() - started) * 1000),
            used_llm=False,
            confidence=0.85,
        )
        reply = validate_answer(reply, context)
        _maybe_audit(audit_store, input.message, reply)
        return reply

    chunks = retrieve_local_chunks(
        input.message,
        top_k=5,
        current_route=context.current_route,
        retriever=retriever,
    )
    retrieval = compute_retrieval_meta(chunks)

    used_llm = False
    used_tools: list[str] = []
    needs_escalation = False

    if is_low_retrieval(retrieval):
        needs_escalation = True

    if llm_reply is not None:
        text = llm_reply.reply
        sources = llm_reply.sources
        actions = llm_reply.actions
        used_llm = True
        used_tools = list(llm_reply.used_tools)
    else:
        text, sources, actions = chunks_to_template_reply(chunks)
        # Template fallback ⇒ escalate
        needs_escalation = True

    confidence = combine_confidence(intent_result.confidence, retrieval)
    if used_llm is False:
        # template path already flagged
        pass

    reply = AssistantReply(
        reply=text,
        sources=sources,
        actions=actions,
        source="local",
        intent=intent,
        latency_ms=int((time.time() - started) * 1000),
        used_llm=used_llm,
        used_tools=used_tools,
        confidence=confidence,
        retrieval=retrieval,
        needs_escalation=needs_escalation
        or confidence < 0.55
        or (retrieval.max_score < RETRIEVAL_LOW),
    )

    reply = validate_answer(reply, context, corpus_was_retrieved=bool(chunks) or retrieval.chunk_count >= 0)

    # Recompute cloud gate flag after validation
    if should_escalate_to_cloud(reply):
        reply.needs_escalation = True

    _maybe_audit(audit_store, input.message, reply)
    return reply


def _maybe_audit(store: TurnAuditStore | None, message: str, reply: AssistantReply) -> None:
    if store is None:
        return
    store.record(
        TurnAudit(
            message=message,
            intent=reply.intent.value,
            confidence=reply.confidence,
            retrieval=reply.retrieval,
            validation=reply.validation,
            engine=reply.source,
            needs_escalation=reply.needs_escalation,
        )
    )

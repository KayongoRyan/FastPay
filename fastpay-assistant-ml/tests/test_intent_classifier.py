from fastpay_assistant.intent_router import classify_intent
from fastpay_assistant.ml.intent_classifier import classify_intent_centroid
from fastpay_assistant.types import AssistantIntent


def test_centroid_balance():
    r = classify_intent_centroid("how much do i have in my wallet")
    assert r.intent == AssistantIntent.BALANCE
    assert r.method == "centroid"
    assert r.confidence >= 0.55


def test_centroid_cash_flow():
    r = classify_intent_centroid("where did my money go this month")
    assert r.intent == AssistantIntent.CASH_FLOW
    assert r.confidence >= 0.4


def test_hybrid_prefers_centroid_when_strong():
    r = classify_intent("help me save more money")
    assert r.intent == AssistantIntent.PLANNING


def test_regex_fallback_product():
    r = classify_intent("asdf escrow transfer momo")
    # product keywords should route somehow useful
    assert r.intent in {
        AssistantIntent.PRODUCT_HELP,
        AssistantIntent.NAVIGATE,
        AssistantIntent.GENERAL,
        AssistantIntent.BALANCE,
    }


def test_empty_message():
    r = classify_intent("   ")
    assert r.intent == AssistantIntent.GENERAL

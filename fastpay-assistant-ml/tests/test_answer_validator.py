from fastpay_assistant.ml.answer_validator import validate_answer
from fastpay_assistant.types import (
    AssistantContext,
    AssistantIntent,
    AssistantReply,
    ChatAction,
    ChatSource,
)


def _base(**kwargs) -> AssistantReply:
    defaults = dict(
        reply="Here is guidance.",
        sources=[ChatSource(title="Wallet", source="local")],
        actions=[ChatAction(label="Open Wallet", href="/wallet")],
        source="local",
        intent=AssistantIntent.GENERAL,
        latency_ms=1,
        used_llm=False,
        confidence=0.8,
    )
    defaults.update(kwargs)
    return AssistantReply(**defaults)


def test_strips_invalid_actions():
    reply = _base(actions=[ChatAction("Hack", href="https://evil.example/x"), ChatAction("Wallet", href="/wallet")])
    out = validate_answer(reply, AssistantContext())
    assert all(a.href != "https://evil.example/x" for a in out.actions)
    assert out.validation and out.validation.stripped_actions == 1


def test_refusal_on_low_confidence():
    reply = _base(confidence=0.2, reply="maybe something?")
    out = validate_answer(reply, AssistantContext())
    assert out.validation and out.validation.refused
    assert "not sure" in out.reply.lower()
    assert out.needs_escalation


def test_balance_guard_rewrites_amounts():
    reply = _base(
        reply="Estimated balance: 99999 RWF in your portfolio holdings.",
        intent=AssistantIntent.BALANCE,
        confidence=0.9,
    )
    out = validate_answer(reply, AssistantContext(wallet_public_key=None))
    assert "Open Wallet to refresh" in out.reply

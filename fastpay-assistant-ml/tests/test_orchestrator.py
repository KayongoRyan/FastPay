from fastpay_assistant.escalation import should_escalate_to_cloud
from fastpay_assistant.ml.action_ranker import rank_actions
from fastpay_assistant.ml.user_profile import build_user_profile
from fastpay_assistant.orchestrator import run_assistant_query
from fastpay_assistant.types import (
    AssistantContext,
    AssistantIntent,
    AssistantPrivacyMode,
    AssistantQueryInput,
    BudgetSnapshot,
    GoalSnapshot,
    RetrievalMeta,
    UserProfile,
)


def _ctx(**kwargs) -> AssistantContext:
    base = dict(
        wallet_public_key="G...",
        wallet_balance_rwf="100000",
        wallet_balance_usdt="50",
        crypto_portfolio_summary="USDT 50 | BTC 0.01 | SOL 2",
        budget_snapshot=BudgetSnapshot(
            monthly_income_rwf=400_000,
            spend_percent=80,
            savings_percent=5,
            goals=[GoalSnapshot("Rainy", 10_000, 100_000)],
        ),
    )
    base.update(kwargs)
    return AssistantContext(**base)


def test_balance_fast_path():
    reply = run_assistant_query(
        AssistantQueryInput(message="how much do i have", context=_ctx())
    )
    assert reply.intent == AssistantIntent.BALANCE
    assert "USDT" in reply.reply
    assert reply.confidence >= 0.5


def test_low_savings_blocks_loan_in_ranker():
    profile = UserProfile(risk_flags=["low_savings", "loan_interest"])
    actions = rank_actions(AssistantIntent.PLANNING, profile)
    assert all(a.href != "/loan/apply" for a in actions)


def test_profile_risk_flags():
    profile = build_user_profile(_ctx())
    assert "high_spend" in profile.risk_flags
    assert "low_savings" in profile.risk_flags
    assert "income:" in profile.summary_chunk


def test_garbage_query_escalates():
    reply = run_assistant_query(
        AssistantQueryInput(
            message="zzzz qqqq xxxx",
            context=_ctx(),
            privacy_mode=AssistantPrivacyMode.CONNECTED,
            is_online=True,
        )
    )
    assert should_escalate_to_cloud(reply) or reply.needs_escalation


def test_cloud_gate_uses_confidence():
    from fastpay_assistant.types import AssistantReply, ChatSource

    weak = AssistantReply(
        reply="hmm",
        sources=[],
        actions=[],
        source="local",
        intent=AssistantIntent.GENERAL,
        latency_ms=1,
        used_llm=True,
        confidence=0.2,
        retrieval=RetrievalMeta(max_score=0.1, score_gap=0.0, chunk_count=1),
    )
    assert should_escalate_to_cloud(weak)

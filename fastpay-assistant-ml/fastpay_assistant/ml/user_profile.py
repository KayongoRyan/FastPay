from __future__ import annotations

from fastpay_assistant.ml.config import HIGH_SPEND_PERCENT, LOW_SAVINGS_PERCENT
from fastpay_assistant.types import AssistantContext, BudgetSnapshot, UserProfile


def build_user_profile(
    context: AssistantContext,
    *,
    top_intents: list[str] | None = None,
    route_visit_counts: dict[str, int] | None = None,
    engagement_topics: list[str] | None = None,
) -> UserProfile:
    budget = context.budget_snapshot
    income = budget.monthly_income_rwf if budget else None
    spend = budget.spend_percent if budget else None
    savings = budget.savings_percent if budget else None

    intents = top_intents or _parse_top_intents(context.engagement_summary)
    visits = route_visit_counts or {}
    topics = engagement_topics or []

    flags: list[str] = []
    if spend is not None and spend > HIGH_SPEND_PERCENT:
        flags.append("high_spend")
    if savings is not None and savings < LOW_SAVINGS_PERCENT:
        flags.append("low_savings")
    if _loan_interest_signal(intents, topics, context.engagement_summary):
        flags.append("loan_interest")

    portfolio = context.crypto_portfolio_summary or "USDT/BTC/SOL"
    chunk = (
        f"income: {income if income is not None else '?'} RWF | "
        f"spend: {spend if spend is not None else '?'}% | "
        f"savings: {savings if savings is not None else '?'}% | "
        f"topIntents: {intents} | "
        f"portfolio: {portfolio} | "
        f"riskFlags: {flags}"
    )

    return UserProfile(
        income_rwf=income,
        spend_percent=spend,
        savings_percent=savings,
        top_intents=intents,
        portfolio=portfolio,
        risk_flags=flags,
        route_visit_counts=visits,
        summary_chunk=chunk,
    )


def _parse_top_intents(engagement_summary: str | None) -> list[str]:
    if not engagement_summary:
        return []
    # crude parse: "top intents: balance, cash_flow"
    lower = engagement_summary.lower()
    known = [
        "navigate",
        "balance",
        "budget",
        "cash_flow",
        "planning",
        "kyc",
        "passcode",
        "product_help",
        "external_info",
        "general",
    ]
    return [i for i in known if i.replace("_", " ") in lower or i in lower][:5]


def _loan_interest_signal(
    intents: list[str],
    topics: list[str],
    engagement_summary: str | None,
) -> bool:
    blob = " ".join(intents + topics + ([engagement_summary] if engagement_summary else [])).lower()
    return "product_help" in blob and any(k in blob for k in ("loan", "borrow", "credit"))


def profile_from_budget(
    budget: BudgetSnapshot,
    *,
    portfolio: str = "USDT/BTC/SOL",
    top_intents: list[str] | None = None,
) -> UserProfile:
    ctx = AssistantContext(
        budget_snapshot=budget,
        crypto_portfolio_summary=portfolio,
    )
    return build_user_profile(ctx, top_intents=top_intents)

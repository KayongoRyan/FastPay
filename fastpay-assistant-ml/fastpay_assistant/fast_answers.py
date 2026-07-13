from __future__ import annotations

import re
import time

from fastpay_assistant.ml.action_ranker import rank_actions
from fastpay_assistant.types import (
    AssistantContext,
    AssistantIntent,
    AssistantReply,
    ChatAction,
    ChatSource,
)


def _reply(
    *,
    text: str,
    sources: list[ChatSource],
    actions: list[ChatAction],
    intent: AssistantIntent,
    started: float,
    confidence: float = 0.9,
) -> AssistantReply:
    return AssistantReply(
        reply=text,
        sources=sources,
        actions=actions,
        source="local",
        intent=intent,
        latency_ms=int((time.time() - started) * 1000),
        used_llm=False,
        used_tools=[],
        confidence=confidence,
        needs_escalation=False,
    )


def try_fast_answer(
    intent: AssistantIntent,
    message: str,
    context: AssistantContext,
) -> AssistantReply | None:
    started = time.time()
    lower = message.lower()
    profile = context.user_profile
    entities = context.extracted_entities

    if intent == AssistantIntent.BALANCE or re.search(
        r"\b(wallet address|public key|btc|sol|usdt)\b", lower
    ):
        if not context.wallet_public_key:
            return _reply(
                text="You do not have a wallet loaded yet. Open Wallet to create your USDT, BTC, and SOL portfolio.",
                sources=[ChatSource(title="Wallet", source="local/wallet")],
                actions=[ChatAction(label="Open Wallet", href="/wallet")],
                intent=AssistantIntent.BALANCE,
                started=started,
            )

        if context.wallet_balance_usdt:
            balance_line = (
                f"Portfolio: {context.wallet_balance_usdt} USDT "
                f"(~{context.wallet_balance_rwf or '?'} RWF)."
            )
        elif context.wallet_balance_rwf:
            balance_line = f"Estimated balance: {context.wallet_balance_rwf} RWF."
        else:
            balance_line = "Balance sync may be offline — open Wallet to refresh."

        portfolio_line = (
            f"\nHoldings: {context.crypto_portfolio_summary}"
            if context.crypto_portfolio_summary
            else ""
        )
        asset_hint = ""
        if entities and entities.asset:
            asset_hint = f"\nYou asked about {entities.asset}."

        return _reply(
            text=(
                "Your FastPay crypto wallet supports USDT, BTC, and SOL.\n"
                f"{balance_line}{portfolio_line}{asset_hint}"
            ),
            sources=[ChatSource(title="Wallet", source="local/wallet", route="/wallet")],
            actions=rank_actions(AssistantIntent.BALANCE, profile, [ChatAction("Open Wallet", "/wallet")]),
            intent=AssistantIntent.BALANCE,
            started=started,
        )

    if intent == AssistantIntent.CASH_FLOW and context.budget_snapshot:
        snap = context.budget_snapshot
        spend_line = (
            f"You allocate {snap.spend_percent}% of income to spending"
            if snap.spend_percent is not None
            else "Spending split not configured yet"
        )
        savings_line = (
            f" and {snap.savings_percent}% to savings."
            if snap.savings_percent is not None
            else "."
        )

        flags = profile.risk_flags if profile else []
        if "high_spend" in flags or (snap.spend_percent is not None and snap.spend_percent > 70):
            coaching = "\nTip: spending is high - review Analytics and trim discretionary buckets."
        elif "low_savings" in flags or (snap.savings_percent is not None and snap.savings_percent < 10):
            coaching = "\nTip: boost savings to at least 10% before increasing transfers."
        else:
            coaching = "\nYour cash-flow split looks balanced - keep tracking weekly in Analytics."

        if context.engagement_summary and "budget" in context.engagement_summary.lower():
            coaching += "\nI see you ask about budgets often — open Analytics to adjust your plan."

        afford = ""
        if entities and entities.amount_rwf is not None and snap.monthly_income_rwf:
            afford = (
                f"\nCan you afford {entities.amount_rwf:,.0f} RWF? "
                f"Monthly income is {snap.monthly_income_rwf:,.0f} RWF."
            )

        income = f"{snap.monthly_income_rwf:,.0f}" if snap.monthly_income_rwf is not None else "?"
        return _reply(
            text=f"Monthly income: {income} RWF.\n{spend_line}{savings_line}{coaching}{afford}",
            sources=[ChatSource(title="Analytics", source="local/cash-flow", route="/analytics")],
            actions=rank_actions(
                AssistantIntent.CASH_FLOW,
                profile,
                [ChatAction("Review cash flow", "/analytics")],
            ),
            intent=AssistantIntent.CASH_FLOW,
            started=started,
        )

    if intent == AssistantIntent.PLANNING:
        goals = context.budget_snapshot.goals if context.budget_snapshot else []
        if goals:
            goal_line = "\n".join(
                f"• {g.name}: {g.saved_rwf:,.0f} / {g.target_rwf:,.0f} RWF" for g in goals[:3]
            )
        else:
            goal_line = "No savings goals yet — set one in Analytics."

        engagement_hint = (
            f"\n\nBased on your activity:\n{context.engagement_summary}"
            if context.engagement_summary
            else ""
        )

        # Never recommend loans when low_savings unless user explicitly asks
        base_actions = [
            ChatAction("Open Analytics", "/analytics"),
            ChatAction("Add funds", "/buy"),
        ]
        if entities and entities.action == "loan":
            base_actions.append(ChatAction("Loan info", "/loan/apply"))

        return _reply(
            text=(
                "Here is your financial direction:\n"
                "1. Keep USDT for day-to-day liquidity\n"
                "2. Hold BTC/SOL for longer-term growth\n"
                "3. Automate savings before spending\n\n"
                f"Goals:\n{goal_line}{engagement_hint}"
            ),
            sources=[ChatSource(title="Planning", source="local/planning", route="/analytics")],
            actions=rank_actions(AssistantIntent.PLANNING, profile, base_actions),
            intent=AssistantIntent.PLANNING,
            started=started,
        )

    if intent == AssistantIntent.KYC and context.user:
        return _reply(
            text=(
                f"Your KYC status is {context.user.kyc_status} "
                f"(level {context.user.kyc_level}). "
                "Upload ID and proof of address to increase limits."
            ),
            sources=[ChatSource(title="KYC", source="local/kyc", route="/(auth)/kyc")],
            actions=[ChatAction(label="Complete KYC", href="/(auth)/kyc")],
            intent=AssistantIntent.KYC,
            started=started,
        )

    if intent == AssistantIntent.PASSCODE:
        return _reply(
            text=(
                "Your 4-digit transaction passcode is stored only on this device. "
                "To reset it, verify your login password first."
            ),
            sources=[ChatSource(title="Passcode", source="local/security")],
            actions=[ChatAction(label="Reset passcode", href="/forgot-passcode")],
            intent=AssistantIntent.PASSCODE,
            started=started,
        )

    if intent == AssistantIntent.BUDGET and context.budget_snapshot and context.budget_snapshot.goals:
        goals = context.budget_snapshot.goals
        matched = next((g for g in goals if g.name.lower() in lower), None)
        if matched:
            return _reply(
                text=(
                    f'Goal "{matched.name}": saved {matched.saved_rwf:,.0f} RWF '
                    f"of {matched.target_rwf:,.0f} RWF target."
                ),
                sources=[ChatSource(title="Analytics", source="local/budget", route="/analytics")],
                actions=rank_actions(
                    AssistantIntent.BUDGET,
                    profile,
                    [ChatAction("Open Analytics", "/analytics")],
                ),
                intent=AssistantIntent.BUDGET,
                started=started,
            )

        summary = "\n".join(
            f"• {g.name}: {g.saved_rwf:,.0f} / {g.target_rwf:,.0f} RWF" for g in goals[:3]
        )
        return _reply(
            text=f"Your savings goals:\n{summary}",
            sources=[ChatSource(title="Analytics", source="local/budget", route="/analytics")],
            actions=rank_actions(
                AssistantIntent.BUDGET,
                profile,
                [ChatAction("View goals", "/analytics?mode=goals")],
            ),
            intent=AssistantIntent.BUDGET,
            started=started,
        )

    if intent == AssistantIntent.NAVIGATE:
        routes = [
            (re.compile(r"\bbill", re.I), "Bills", "/bills"),
            (re.compile(r"\bfamily", re.I), "Family", "/services/family-setup"),
            (re.compile(r"\bloan", re.I), "Loan", "/loan/apply"),
            (re.compile(r"\birembo", re.I), "Irembo", "/irembo"),
            (re.compile(r"\boffline", re.I), "Offline", "/offline/receive"),
            (re.compile(r"\bbuy|momo|airtime", re.I), "Buy", "/buy"),
            (re.compile(r"\banalytic|budget|goal", re.I), "Analytics", "/analytics"),
            (re.compile(r"\bsetting", re.I), "Settings", "/settings"),
            (re.compile(r"\bkyc|verify", re.I), "KYC", "/(auth)/kyc"),
            (re.compile(r"\bwallet|transfer|send", re.I), "Wallet", "/wallet"),
        ]
        for pattern, label, href in routes:
            if pattern.search(lower):
                return _reply(
                    text=f"Opening {label}. Tap below if you are not redirected automatically.",
                    sources=[ChatSource(title=label, source="local/nav", route=href)],
                    actions=[ChatAction(label=f"Go to {label}", href=href)],
                    intent=AssistantIntent.NAVIGATE,
                    started=started,
                )

    return None

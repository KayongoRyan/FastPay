from __future__ import annotations

import argparse
import json
import sys

from fastpay_assistant.escalation import should_escalate_to_cloud
from fastpay_assistant.orchestrator import run_assistant_query
from fastpay_assistant.types import (
    AssistantContext,
    AssistantPrivacyMode,
    AssistantQueryInput,
    AuthUser,
    BudgetSnapshot,
    GoalSnapshot,
    reply_to_dict,
)


def _build_demo_context() -> AssistantContext:
    return AssistantContext(
        wallet_public_key="GDEMO...",
        wallet_balance_rwf="125000",
        wallet_balance_usdt="85.40",
        crypto_portfolio_summary="USDT 85.40 | BTC 0.0012 | SOL 1.5",
        engagement_summary="top intents: balance, cash_flow, planning",
        budget_snapshot=BudgetSnapshot(
            monthly_income_rwf=500_000,
            spend_percent=75,
            savings_percent=8,
            goals=[GoalSnapshot(name="Emergency", saved_rwf=40_000, target_rwf=200_000)],
        ),
        user=AuthUser(kyc_status="verified", kyc_level=2),
    )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="FastPay Assistant ML CLI")
    parser.add_argument("message", nargs="?", default="how much do i have")
    parser.add_argument("--mode", choices=["private", "connected"], default="private")
    parser.add_argument("--online", action="store_true")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args(argv)

    result = run_assistant_query(
        AssistantQueryInput(
            message=args.message,
            context=_build_demo_context(),
            privacy_mode=AssistantPrivacyMode(args.mode),
            is_online=args.online,
        )
    )

    if args.json:
        print(json.dumps(reply_to_dict(result), indent=2))
    else:
        print(f"intent={result.intent.value} conf={result.confidence:.2f} "
              f"escalate={should_escalate_to_cloud(result)}")
        if result.retrieval:
            print(
                f"retrieval max={result.retrieval.max_score:.2f} "
                f"gap={result.retrieval.score_gap:.2f} n={result.retrieval.chunk_count}"
            )
        print(result.reply)
        for a in result.actions:
            print(f"  -> {a.label}: {a.href}")

    return 0


if __name__ == "__main__":
    sys.exit(main())

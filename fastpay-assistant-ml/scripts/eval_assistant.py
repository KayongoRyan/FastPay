#!/usr/bin/env python3
"""Eval harness — golden set precision on intent + mustInclude/mustNotInclude."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from fastpay_assistant.intent_router import classify_intent
from fastpay_assistant.orchestrator import run_assistant_query
from fastpay_assistant.types import (
    AssistantContext,
    AssistantPrivacyMode,
    AssistantQueryInput,
    AuthUser,
    BudgetSnapshot,
    GoalSnapshot,
)


def demo_context() -> AssistantContext:
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


def evaluate(golden_path: Path) -> dict:
    cases = json.loads(golden_path.read_text(encoding="utf-8"))
    intent_ok = 0
    phrase_ok = 0
    route_ok = 0
    route_n = 0
    escalate_ok = 0
    escalate_n = 0
    failures: list[dict] = []

    for case in cases:
        mode = AssistantPrivacyMode(case.get("privacy_mode", "private"))
        intent = classify_intent(case["question"])
        reply = run_assistant_query(
            AssistantQueryInput(
                message=case["question"],
                context=demo_context(),
                privacy_mode=mode,
            )
        )

        i_pass = intent.intent.value == case["expected_intent"]
        if i_pass:
            intent_ok += 1

        text = reply.reply
        must = all(p.lower() in text.lower() for p in case.get("must_include", []))
        must_not = all(p.lower() not in text.lower() for p in case.get("must_not_include", []))
        p_pass = must and must_not
        if p_pass:
            phrase_ok += 1

        if "expected_route" in case:
            route_n += 1
            hrefs = {a.href for a in reply.actions}
            if case["expected_route"] in hrefs or any(
                case["expected_route"] in (s.route or "") for s in reply.sources
            ):
                route_ok += 1
            else:
                r_pass = False
            r_pass = case["expected_route"] in hrefs or any(
                case["expected_route"] in (s.route or "") for s in reply.sources
            )
        else:
            r_pass = True

        if case.get("expect_escalation"):
            escalate_n += 1
            e_pass = reply.needs_escalation
            if e_pass:
                escalate_ok += 1
        else:
            e_pass = True

        if not (i_pass and p_pass and r_pass and e_pass):
            failures.append(
                {
                    "id": case["id"],
                    "question": case["question"],
                    "got_intent": intent.intent.value,
                    "expected_intent": case["expected_intent"],
                    "intent_pass": i_pass,
                    "phrase_pass": p_pass,
                    "route_pass": r_pass,
                    "escalate_pass": e_pass,
                    "confidence": reply.confidence,
                    "reply_preview": text[:160],
                }
            )

    n = len(cases)
    intent_acc = intent_ok / n if n else 0.0
    phrase_rate = phrase_ok / n if n else 0.0
    # overall pass = intent + phrases (primary metric from plan)
    pass_rate = sum(
        1
        for c in cases
        if classify_intent(c["question"]).intent.value == c["expected_intent"]
        # recompute phrase against stored failures is awkward; use failures list
    )
    # better: n - unique failures that failed intent or phrase
    overall = (n - len([f for f in failures if not f["intent_pass"] or not f["phrase_pass"]])) / n if n else 0.0

    return {
        "n": n,
        "intent_accuracy": round(intent_acc, 4),
        "phrase_pass_rate": round(phrase_rate, 4),
        "overall_pass_rate": round(overall, 4),
        "route_accuracy": round(route_ok / route_n, 4) if route_n else None,
        "escalation_accuracy": round(escalate_ok / escalate_n, 4) if escalate_n else None,
        "failures": failures,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Eval FastPay assistant golden set")
    parser.add_argument(
        "--golden",
        type=Path,
        default=ROOT / "data" / "golden_set.json",
    )
    parser.add_argument("--min-pass", type=float, default=0.8)
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args(argv)

    report = evaluate(args.golden)
    if args.json:
        print(json.dumps(report, indent=2))
    else:
        print(f"n={report['n']}")
        print(f"intent_accuracy={report['intent_accuracy']:.1%}")
        print(f"phrase_pass_rate={report['phrase_pass_rate']:.1%}")
        print(f"overall_pass_rate={report['overall_pass_rate']:.1%}")
        if report["route_accuracy"] is not None:
            print(f"route_accuracy={report['route_accuracy']:.1%}")
        if report["escalation_accuracy"] is not None:
            print(f"escalation_accuracy={report['escalation_accuracy']:.1%}")
        if report["failures"]:
            print(f"\nfailures ({len(report['failures'])}):")
            for f in report["failures"][:15]:
                print(
                    f"  {f['id']}: intent {f['got_intent']}!={f['expected_intent']} "
                    f"phrase={f['phrase_pass']} conf={f['confidence']:.2f}"
                )

    return 0 if report["overall_pass_rate"] >= args.min_pass else 1


if __name__ == "__main__":
    sys.exit(main())

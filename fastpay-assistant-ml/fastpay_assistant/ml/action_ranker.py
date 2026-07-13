from __future__ import annotations

from dataclasses import dataclass

from fastpay_assistant.ml.config import (
    INTENT_MATCH_BOOST,
    RISK_FLAG_BOOST,
    ROUTE_VISIT_PENALTY,
    ROUTE_VISIT_PENALTY_AFTER,
)
from fastpay_assistant.types import AssistantIntent, ChatAction, UserProfile


@dataclass
class RankedAction:
    action: ChatAction
    score: float


# intent → preferred routes
INTENT_ROUTES: dict[AssistantIntent, list[tuple[str, str]]] = {
    AssistantIntent.BALANCE: [("Open Wallet", "/wallet")],
    AssistantIntent.CASH_FLOW: [("Review cash flow", "/analytics")],
    AssistantIntent.PLANNING: [
        ("Open Analytics", "/analytics"),
        ("Add funds", "/buy"),
    ],
    AssistantIntent.BUDGET: [("View goals", "/analytics?mode=goals")],
    AssistantIntent.KYC: [("Complete KYC", "/(auth)/kyc")],
    AssistantIntent.PASSCODE: [("Reset passcode", "/forgot-passcode")],
    AssistantIntent.NAVIGATE: [],
    AssistantIntent.PRODUCT_HELP: [
        ("Open Bills", "/bills"),
        ("Transfer", "/wallet/transfer"),
    ],
    AssistantIntent.GENERAL: [("Open Support", "/support")],
    AssistantIntent.EXTERNAL_INFO: [("Open Settings", "/settings")],
}

RISK_ACTIONS: dict[str, list[tuple[str, str]]] = {
    "high_spend": [("Review Analytics", "/analytics")],
    "low_savings": [("Set savings goal", "/analytics?mode=goals"), ("Add funds", "/buy")],
    "loan_interest": [("Loan info", "/loan/apply")],
}


def _routes_match(a: str, b: str) -> bool:
    return a == b or a.split("?")[0] == b.split("?")[0]


def dedupe_actions(actions: list[ChatAction]) -> list[ChatAction]:
    seen: set[str] = set()
    out: list[ChatAction] = []
    for action in actions:
        if action.href in seen:
            continue
        seen.add(action.href)
        out.append(action)
    return out


def rank_actions(
    intent: AssistantIntent,
    profile: UserProfile | None,
    candidates: list[ChatAction] | None = None,
    *,
    top_n: int = 2,
) -> list[ChatAction]:
    scored: list[RankedAction] = []
    visits = profile.route_visit_counts if profile else {}

    pool: list[ChatAction] = list(candidates or [])
    for label, href in INTENT_ROUTES.get(intent, []):
        pool.append(ChatAction(label=label, href=href))

    if profile:
        for flag in profile.risk_flags:
            # never push loans when low_savings unless user intent is loan-related
            if flag == "loan_interest" and "low_savings" in profile.risk_flags:
                if intent != AssistantIntent.PRODUCT_HELP:
                    continue
            for label, href in RISK_ACTIONS.get(flag, []):
                if href == "/loan/apply" and "low_savings" in profile.risk_flags:
                    continue
                pool.append(ChatAction(label=label, href=href))

    for action in dedupe_actions(pool):
        score = 0.0
        preferred = {h for _, h in INTENT_ROUTES.get(intent, [])}
        if any(_routes_match(action.href, p) for p in preferred):
            score += INTENT_MATCH_BOOST

        if profile:
            matched_flags: set[str] = set()
            for flag in profile.risk_flags:
                flag_hrefs = {h for _, h in RISK_ACTIONS.get(flag, [])}
                if action.href in flag_hrefs:
                    matched_flags.add(flag)
            score += RISK_FLAG_BOOST * len(matched_flags)

            count = visits.get(action.href, visits.get(action.href.split("?")[0], 0))
            if count >= ROUTE_VISIT_PENALTY_AFTER:
                score -= ROUTE_VISIT_PENALTY

        scored.append(RankedAction(action=action, score=score))

    scored.sort(key=lambda r: r.score, reverse=True)
    return [r.action for r in scored[:top_n]]

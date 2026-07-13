from __future__ import annotations

import re
from urllib.parse import urlparse

from fastpay_assistant.ml.config import ALLOWED_HREFS, REFUSAL_CONFIDENCE, SAFE_NAV_ACTIONS
from fastpay_assistant.types import (
    AssistantContext,
    AssistantReply,
    ChatAction,
    ChatSource,
    ValidationResult,
)

_BALANCE_RE = re.compile(r"\b(balance|rwf|usdt|holdings|portfolio)\b", re.I)


def _href_allowed(href: str) -> bool:
    if href in ALLOWED_HREFS:
        return True
    # allow query-string variants of known bases
    base = href.split("?")[0]
    if base in ALLOWED_HREFS:
        return True
    # corpus routes often look like /services/...
    if base.startswith("/") and not urlparse(href).scheme:
        path_parts = base.strip("/").split("/")
        if path_parts and path_parts[0] in {
            "wallet",
            "buy",
            "bills",
            "analytics",
            "settings",
            "support",
            "loan",
            "irembo",
            "offline",
            "services",
            "convert",
            "bank-pay",
            "forgot-passcode",
            "(auth)",
            "login",
        }:
            return True
    return False


def validate_answer(
    reply: AssistantReply,
    context: AssistantContext,
    *,
    corpus_was_retrieved: bool = False,
) -> AssistantReply:
    reasons: list[str] = []
    confidence = reply.confidence
    downgraded = False
    stripped = 0
    text = reply.reply
    actions = list(reply.actions)
    sources = list(reply.sources)
    refused = False

    # Balance guard
    if _BALANCE_RE.search(text) and not context.wallet_balance_rwf and not context.wallet_balance_usdt:
        if "wallet" in text.lower() or "balance" in text.lower():
            if not context.wallet_public_key or (
                "balance" in text.lower() and not context.wallet_balance_rwf
            ):
                # only rewrite hard claims about amounts when balance missing
                if re.search(r"\d", text) or "estimated balance" in text.lower() or "portfolio:" in text.lower():
                    text = "Open Wallet to refresh your balance — I don't have a current figure yet."
                    sources = [ChatSource(title="Wallet", source="local/wallet", route="/wallet")]
                    actions = [ChatAction(label="Open Wallet", href="/wallet")]
                    reasons.append("balance_guard")
                    confidence = min(confidence, 0.5)

    # Action allowlist
    kept: list[ChatAction] = []
    for action in actions:
        if _href_allowed(action.href):
            kept.append(action)
        else:
            stripped += 1
            reasons.append(f"stripped_action:{action.href}")
    actions = kept

    # Grounding check
    if corpus_was_retrieved and not sources and not reply.used_llm:
        confidence *= 0.6
        downgraded = True
        reasons.append("ungrounded_template")

    # Refusal template
    if confidence < REFUSAL_CONFIDENCE:
        text = (
            "I'm not sure I have a reliable answer for that. "
            "Try rephrasing, or open one of these screens."
        )
        sources = [ChatSource(title="Support", source="local/refusal")]
        actions = [ChatAction(**a) for a in SAFE_NAV_ACTIONS]
        confidence = min(confidence, REFUSAL_CONFIDENCE - 0.01)
        refused = True
        reasons.append("low_confidence_refusal")
        reply.needs_escalation = True

    ok = not refused and stripped == 0 and not downgraded
    validation = ValidationResult(
        ok=ok,
        reasons=reasons,
        downgraded_confidence=downgraded,
        stripped_actions=stripped,
        refused=refused,
    )

    reply.reply = text
    reply.sources = sources
    reply.actions = actions
    reply.confidence = confidence
    reply.validation = validation
    return reply

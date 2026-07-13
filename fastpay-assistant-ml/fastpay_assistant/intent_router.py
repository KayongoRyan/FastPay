from __future__ import annotations

import re

from fastpay_assistant.ml.config import GENERAL_CONFIDENCE, INTENT_CENTROID_MIN, REGEX_CONFIDENCE
from fastpay_assistant.ml.intent_classifier import classify_intent_centroid
from fastpay_assistant.types import AssistantIntent, IntentResult

PATTERNS: list[tuple[AssistantIntent, re.Pattern[str]]] = [
    (
        AssistantIntent.NAVIGATE,
        re.compile(
            r"\b(go to|open|take me to|navigate|show me|where is|how do i (open|find|get to))\b",
            re.I,
        ),
    ),
    (
        AssistantIntent.BALANCE,
        re.compile(
            r"\b(balance|how much (do i|money)|wallet address|public key|usdt|btc|bitcoin|sol|solana)\b",
            re.I,
        ),
    ),
    (
        AssistantIntent.CASH_FLOW,
        re.compile(
            r"\b(cash flow|cashflow|spending|expenses|income|afford|overspend|burn rate|where (did|does) my money)\b",
            re.I,
        ),
    ),
    (
        AssistantIntent.PLANNING,
        re.compile(
            r"\b(plan|budget plan|financial plan|save more|savings plan|money management|how should i|advice|direction|guide me)\b",
            re.I,
        ),
    ),
    (
        AssistantIntent.BUDGET,
        re.compile(
            r"\b(budget|savings goal|saved toward|spend percent|family plan|analytics)\b",
            re.I,
        ),
    ),
    (
        AssistantIntent.KYC,
        re.compile(r"\b(kyc|verify|identity|national id|proof of address|verification)\b", re.I),
    ),
    (
        AssistantIntent.PASSCODE,
        re.compile(r"\b(passcode|pin|transaction pin|forgot passcode|reset passcode)\b", re.I),
    ),
    (
        AssistantIntent.EXTERNAL_INFO,
        re.compile(
            r"\b(exchange rate|forex|usd|eur|rra|irembo|tax|government|horizon|stellar network|news|weather|outside)\b",
            re.I,
        ),
    ),
]

_PRODUCT_RE = re.compile(
    r"\b(bill|transfer|loan|momo|airtime|escrow|insurance|offline|buy|convert)\b",
    re.I,
)


def classify_intent_regex(message: str) -> IntentResult:
    normalized = message.strip().lower()
    if not normalized:
        return IntentResult(AssistantIntent.GENERAL, GENERAL_CONFIDENCE, "regex")

    for intent, pattern in PATTERNS:
        if pattern.search(normalized):
            return IntentResult(intent, REGEX_CONFIDENCE, "regex")

    if _PRODUCT_RE.search(normalized):
        return IntentResult(AssistantIntent.PRODUCT_HELP, REGEX_CONFIDENCE, "regex")

    return IntentResult(AssistantIntent.GENERAL, GENERAL_CONFIDENCE, "regex")


def classify_intent(message: str) -> IntentResult:
    """Prefer centroid when confidence >= 0.55, else regex, else general."""
    centroid = classify_intent_centroid(message)
    if centroid.confidence >= INTENT_CENTROID_MIN:
        return centroid

    regex = classify_intent_regex(message)
    if regex.intent != AssistantIntent.GENERAL:
        return regex

    if centroid.confidence > GENERAL_CONFIDENCE:
        return centroid

    return IntentResult(AssistantIntent.GENERAL, GENERAL_CONFIDENCE, "regex")

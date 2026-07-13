from __future__ import annotations

import re

from fastpay_assistant.types import ExtractedEntities

_AMOUNT_RE = re.compile(
    r"(?:rwf\s*)?(\d{1,3}(?:,\d{3})+|\d{4,}|\d+)(?:\s*(?:rwf|frw))?",
    re.I,
)
_ASSET_RE = re.compile(r"\b(usdt|btc|bitcoin|sol|solana)\b", re.I)
_TIMEFRAME_RE = re.compile(
    r"\b(today|this week|this month|last month|weekly|monthly|yearly|this year)\b",
    re.I,
)
_ACTION_RE = re.compile(r"\b(transfer|send|save|savings|loan|borrow)\b", re.I)

_ASSET_MAP = {
    "usdt": "USDT",
    "btc": "BTC",
    "bitcoin": "BTC",
    "sol": "SOL",
    "solana": "SOL",
}

_ACTION_MAP = {
    "transfer": "transfer",
    "send": "transfer",
    "save": "save",
    "savings": "save",
    "loan": "loan",
    "borrow": "loan",
}


def extract_entities(message: str) -> ExtractedEntities:
    amount: float | None = None
    for match in _AMOUNT_RE.finditer(message):
        raw = match.group(1).replace(",", "").replace(" ", "")
        try:
            value = float(raw)
        except ValueError:
            continue
        # skip tiny numbers that are likely years / levels unless currency nearby
        span = message[max(0, match.start() - 4) : match.end() + 4].lower()
        if value < 100 and "rwf" not in span and "frw" not in span:
            continue
        amount = value
        break

    asset = None
    am = _ASSET_RE.search(message)
    if am:
        asset = _ASSET_MAP[am.group(1).lower()]  # type: ignore[assignment]

    timeframe = None
    tm = _TIMEFRAME_RE.search(message)
    if tm:
        timeframe = tm.group(1).lower()

    action = None
    act = _ACTION_RE.search(message)
    if act:
        action = _ACTION_MAP[act.group(1).lower()]  # type: ignore[assignment]

    return ExtractedEntities(
        amount_rwf=amount,
        asset=asset,
        timeframe=timeframe,
        action=action,
    )

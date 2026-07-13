"""Thresholds and routing knobs for the assistant ML pipeline."""

from __future__ import annotations

# Retrieval (normalized BM25)
RETRIEVAL_HIGH = 0.8
RETRIEVAL_LOW = 0.35
SCORE_GAP_MIN = 0.1

# Intent classifier
INTENT_CENTROID_MIN = 0.55
REGEX_CONFIDENCE = 0.75
GENERAL_CONFIDENCE = 0.3

# Escalation / refusal
CLOUD_ESCALATION_THRESHOLD = 0.55
REFUSAL_CONFIDENCE = 0.4

# Money intents that can take grounded fast-path
MONEY_INTENTS = frozenset({"balance", "cash_flow", "planning", "budget"})

# Cloud preference intents when Connected
CLOUD_PREFERRED_INTENTS = frozenset({"general", "product_help"})

# Risk flag thresholds
HIGH_SPEND_PERCENT = 70.0
LOW_SAVINGS_PERCENT = 10.0

# Action ranker
INTENT_MATCH_BOOST = 3.0
RISK_FLAG_BOOST = 2.0
ROUTE_VISIT_PENALTY_AFTER = 5
ROUTE_VISIT_PENALTY = 1.0

ALLOWED_HREFS = frozenset(
    {
        "/wallet",
        "/wallet/transfer",
        "/wallet/receive",
        "/buy",
        "/bills",
        "/analytics",
        "/analytics?mode=goals",
        "/settings",
        "/support",
        "/(auth)/kyc",
        "/forgot-passcode",
        "/loan/apply",
        "/irembo",
        "/offline/receive",
        "/services/family-setup",
        "/services/family-wallet",
        "/services/bill",
        "/services/escrow",
        "/services/insurance-plans",
        "/services/voucher",
        "/convert",
        "/bank-pay",
        "/login",
    }
)

SAFE_NAV_ACTIONS = (
    {"label": "Open Wallet", "href": "/wallet"},
    {"label": "Open Support", "href": "/support"},
    {"label": "Open Analytics", "href": "/analytics"},
)

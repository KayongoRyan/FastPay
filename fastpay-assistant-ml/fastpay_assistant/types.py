from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Literal


class AssistantPrivacyMode(str, Enum):
    PRIVATE = "private"
    CONNECTED = "connected"


class AssistantIntent(str, Enum):
    NAVIGATE = "navigate"
    BALANCE = "balance"
    BUDGET = "budget"
    CASH_FLOW = "cash_flow"
    PLANNING = "planning"
    KYC = "kyc"
    PASSCODE = "passcode"
    PRODUCT_HELP = "product_help"
    EXTERNAL_INFO = "external_info"
    GENERAL = "general"


AssistantMessageSource = Literal["local", "cloud"]
IntentMethod = Literal["regex", "centroid"]


@dataclass
class ChatAction:
    label: str
    href: str


@dataclass
class ChatSource:
    title: str
    source: str
    route: str | None = None


@dataclass
class GoalSnapshot:
    name: str
    saved_rwf: float
    target_rwf: float


@dataclass
class BudgetSnapshot:
    monthly_income_rwf: float | None = None
    spend_percent: float | None = None
    savings_percent: float | None = None
    goals: list[GoalSnapshot] = field(default_factory=list)


@dataclass
class AuthUser:
    kyc_status: str = "unverified"
    kyc_level: int = 0


@dataclass
class ExtractedEntities:
    amount_rwf: float | None = None
    asset: Literal["USDT", "BTC", "SOL"] | None = None
    timeframe: str | None = None
    action: Literal["transfer", "save", "loan"] | None = None


@dataclass
class UserProfile:
    income_rwf: float | None = None
    spend_percent: float | None = None
    savings_percent: float | None = None
    top_intents: list[str] = field(default_factory=list)
    portfolio: str = "USDT/BTC/SOL"
    risk_flags: list[str] = field(default_factory=list)
    route_visit_counts: dict[str, int] = field(default_factory=dict)
    summary_chunk: str = ""


@dataclass
class AssistantContext:
    current_route: str | None = None
    screen_title: str | None = None
    wallet_public_key: str | None = None
    wallet_balance_xlm: float | None = None
    wallet_balance_rwf: str | None = None
    wallet_balance_usdt: str | None = None
    crypto_portfolio_summary: str | None = None
    engagement_summary: str | None = None
    budget_snapshot: BudgetSnapshot | None = None
    user: AuthUser | None = None
    extracted_entities: ExtractedEntities | None = None
    user_profile: UserProfile | None = None


@dataclass
class LocalCorpusChunk:
    text: str
    source: str
    title: str
    route: str | None = None
    category: str | None = None
    action_route: str | None = None


@dataclass
class RetrievedLocalChunk(LocalCorpusChunk):
    score: float = 0.0


@dataclass
class IntentResult:
    intent: AssistantIntent
    confidence: float
    method: IntentMethod


@dataclass
class RetrievalMeta:
    max_score: float
    score_gap: float
    chunk_count: int


@dataclass
class ValidationResult:
    ok: bool
    reasons: list[str] = field(default_factory=list)
    downgraded_confidence: bool = False
    stripped_actions: int = 0
    refused: bool = False


@dataclass
class AssistantQueryInput:
    message: str
    context: AssistantContext
    privacy_mode: AssistantPrivacyMode = AssistantPrivacyMode.PRIVATE
    is_online: bool = False
    use_local_llm: bool = False


@dataclass
class AssistantReply:
    reply: str
    sources: list[ChatSource]
    actions: list[ChatAction]
    source: AssistantMessageSource
    intent: AssistantIntent
    latency_ms: int
    used_llm: bool
    used_tools: list[str] = field(default_factory=list)
    confidence: float = 1.0
    retrieval: RetrievalMeta | None = None
    validation: ValidationResult | None = None
    needs_escalation: bool = False


@dataclass
class FeedbackEvent:
    message_id: str
    rating: Literal[1, -1]
    intent: str
    confidence: float
    engine: Literal["local", "cloud"]
    conversation_id: str | None = None
    chunk_ids: list[str] = field(default_factory=list)
    comment: str | None = None


@dataclass
class TurnAudit:
    message: str
    intent: str
    confidence: float
    retrieval: RetrievalMeta | None
    validation: ValidationResult | None
    engine: Literal["local", "cloud"]
    needs_escalation: bool


def reply_to_dict(r: AssistantReply) -> dict[str, Any]:
    return {
        "reply": r.reply,
        "sources": [s.__dict__ for s in r.sources],
        "actions": [a.__dict__ for a in r.actions],
        "source": r.source,
        "intent": r.intent.value,
        "latencyMs": r.latency_ms,
        "usedLlm": r.used_llm,
        "usedTools": r.used_tools,
        "confidence": r.confidence,
        "retrieval": r.retrieval.__dict__ if r.retrieval else None,
        "validation": {
            "ok": r.validation.ok,
            "reasons": r.validation.reasons,
            "downgradedConfidence": r.validation.downgraded_confidence,
            "strippedActions": r.validation.stripped_actions,
            "refused": r.validation.refused,
        }
        if r.validation
        else None,
        "needsEscalation": r.needs_escalation,
    }

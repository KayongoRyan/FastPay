from __future__ import annotations

import json
import time
from pathlib import Path

from fastpay_assistant.types import FeedbackEvent, TurnAudit


class FeedbackStore:
    """Local feedback queue (Phase 4) — sync when online."""

    def __init__(self, path: Path | None = None):
        self.path = path or Path.home() / ".fastpay" / "assistant_feedback.jsonl"
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def record(self, event: FeedbackEvent) -> None:
        row = {
            "conversationId": event.conversation_id,
            "messageId": event.message_id,
            "rating": event.rating,
            "intent": event.intent,
            "confidence": event.confidence,
            "chunkIds": event.chunk_ids,
            "engine": event.engine,
            "comment": event.comment,
            "ts": time.time(),
        }
        with self.path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(row) + "\n")

    def load_all(self) -> list[dict]:
        if not self.path.exists():
            return []
        rows = []
        for line in self.path.read_text(encoding="utf-8").splitlines():
            if line.strip():
                rows.append(json.loads(line))
        return rows

    def pending(self) -> list[dict]:
        return [r for r in self.load_all() if not r.get("synced")]

    def mark_synced(self, message_ids: list[str]) -> None:
        rows = self.load_all()
        ids = set(message_ids)
        for row in rows:
            if row.get("messageId") in ids:
                row["synced"] = True
        with self.path.open("w", encoding="utf-8") as f:
            for row in rows:
                f.write(json.dumps(row) + "\n")


class TurnAuditStore:
    """Private-mode local turn audit (no extra PII beyond engagement)."""

    def __init__(self, path: Path | None = None):
        self.path = path or Path.home() / ".fastpay" / "assistant_turn_audit.jsonl"
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def record(self, audit: TurnAudit) -> None:
        row = {
            "message": audit.message,
            "intent": audit.intent,
            "confidence": audit.confidence,
            "retrieval": audit.retrieval.__dict__ if audit.retrieval else None,
            "validation": {
                "ok": audit.validation.ok,
                "reasons": audit.validation.reasons,
                "refused": audit.validation.refused,
            }
            if audit.validation
            else None,
            "engine": audit.engine,
            "needsEscalation": audit.needs_escalation,
            "ts": time.time(),
        }
        with self.path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(row) + "\n")

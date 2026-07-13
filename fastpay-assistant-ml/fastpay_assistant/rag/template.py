from __future__ import annotations

from fastpay_assistant.ml.action_ranker import dedupe_actions
from fastpay_assistant.types import ChatAction, ChatSource, RetrievedLocalChunk


def chunks_to_template_reply(
    chunks: list[RetrievedLocalChunk],
) -> tuple[str, list[ChatSource], list[ChatAction]]:
    top = chunks[:3]
    if not top:
        return (
            "I could not find FastPay docs for that. Try asking about transfers, bills, savings, loans, or KYC.",
            [],
            [],
        )

    lines = [f"• {c.title or c.source}: {c.text[:220]}…" for c in top]
    reply = "\n".join(
        [
            "Here is what I found in FastPay:",
            *lines,
            "",
            "This is product guidance, not personal financial advice.",
        ]
    )
    sources = [
        ChatSource(title=c.title or c.source, source=c.source, route=c.route) for c in top
    ]
    actions = dedupe_actions(
        [
            ChatAction(
                label=f"Open {c.title or 'screen'}",
                href=c.action_route or c.route or "/support",
            )
            for c in top
            if c.route or c.action_route
        ][:2]
    )
    return reply, sources, actions

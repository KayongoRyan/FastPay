#!/usr/bin/env python3
"""Aggregate downvoted turns → group by intent + chunkIds for corpus fixes."""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from fastpay_assistant.feedback import FeedbackStore


def build_report(rows: list[dict]) -> dict:
    down = [r for r in rows if r.get("rating") == -1]
    by_intent: dict[str, list[dict]] = defaultdict(list)
    chunk_counts: Counter[str] = Counter()

    for row in down:
        intent = row.get("intent", "unknown")
        by_intent[intent].append(row)
        for cid in row.get("chunkIds") or []:
            chunk_counts[cid] += 1

    return {
        "total_feedback": len(rows),
        "downvotes": len(down),
        "upvotes": sum(1 for r in rows if r.get("rating") == 1),
        "by_intent": {
            intent: {
                "count": len(items),
                "comments": [i.get("comment") for i in items if i.get("comment")],
                "sample_message_ids": [i.get("messageId") for i in items[:5]],
            }
            for intent, items in sorted(by_intent.items(), key=lambda x: -len(x[1]))
        },
        "top_bad_chunks": chunk_counts.most_common(20),
        "recommended_actions": [
            "Review static corpus chunks listed in top_bad_chunks",
            "Add exemplars for intents with high downvote density",
            "Check answer-validator refusals correlated with low confidence",
        ],
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Export assistant feedback report")
    parser.add_argument("--path", type=Path, default=None, help="feedback jsonl path")
    parser.add_argument("--out", type=Path, default=None)
    args = parser.parse_args(argv)

    store = FeedbackStore(path=args.path) if args.path else FeedbackStore()
    report = build_report(store.load_all())
    text = json.dumps(report, indent=2)
    if args.out:
        args.out.write_text(text, encoding="utf-8")
        print(f"wrote {args.out}")
    else:
        print(text)
    return 0


if __name__ == "__main__":
    sys.exit(main())

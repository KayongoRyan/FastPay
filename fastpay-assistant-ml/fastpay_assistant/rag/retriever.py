from __future__ import annotations

import json
from pathlib import Path

from fastpay_assistant.rag.bm25 import bm25_score, tokenize
from fastpay_assistant.types import LocalCorpusChunk, RetrievedLocalChunk

_DEFAULT_CORPUS = Path(__file__).resolve().parents[2] / "data" / "sample_corpus.json"


class LocalRetriever:
    def __init__(self, chunks: list[LocalCorpusChunk] | None = None, corpus_path: Path | None = None):
        if chunks is None:
            path = corpus_path or _DEFAULT_CORPUS
            raw = json.loads(path.read_text(encoding="utf-8"))
            chunks = [LocalCorpusChunk(**c) for c in raw]

        self._docs: list[dict] = []
        self._doc_freq: dict[str, int] = {}
        total_len = 0

        for chunk in chunks:
            text = f"{chunk.title or ''} {chunk.text or ''} {chunk.route or ''}"
            tokens = tokenize(text)
            self._docs.append(
                {
                    "chunk": chunk,
                    "tokens": tokens,
                    "doc_length": len(tokens),
                }
            )
            total_len += len(tokens)
            for term in set(tokens):
                self._doc_freq[term] = self._doc_freq.get(term, 0) + 1

        self._avg_doc_length = (total_len / len(self._docs)) if self._docs else 0.0

    @property
    def chunk_count(self) -> int:
        return len(self._docs)

    def retrieve(
        self,
        query: str,
        top_k: int = 5,
        current_route: str | None = None,
        min_score: float = 0.0,
    ) -> list[RetrievedLocalChunk]:
        query_tokens = tokenize(query)
        if not query_tokens:
            return []

        scored: list[RetrievedLocalChunk] = []
        n = len(self._docs)
        for doc in self._docs:
            score = bm25_score(
                query_tokens,
                doc["tokens"],
                doc["doc_length"],
                self._avg_doc_length,
                self._doc_freq,
                n,
            )
            chunk: LocalCorpusChunk = doc["chunk"]
            if current_route and chunk.route == current_route:
                score += 0.5
            if score <= min_score:
                continue
            scored.append(
                RetrievedLocalChunk(
                    text=chunk.text,
                    source=chunk.source,
                    title=chunk.title,
                    route=chunk.route,
                    category=chunk.category,
                    action_route=chunk.action_route,
                    score=score,
                )
            )

        scored.sort(key=lambda c: c.score, reverse=True)
        return scored[:top_k]


_default_retriever: LocalRetriever | None = None


def get_default_retriever() -> LocalRetriever:
    global _default_retriever
    if _default_retriever is None:
        _default_retriever = LocalRetriever()
    return _default_retriever


def retrieve_local_chunks(
    query: str,
    top_k: int = 5,
    current_route: str | None = None,
    min_score: float = 0.0,
    retriever: LocalRetriever | None = None,
) -> list[RetrievedLocalChunk]:
    r = retriever or get_default_retriever()
    return r.retrieve(query, top_k=top_k, current_route=current_route, min_score=min_score)

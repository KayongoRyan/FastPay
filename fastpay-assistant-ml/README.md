# FastPay Assistant ML (Python)

**Offline eval brain** for the FastPay assistant. Product runtime stays in:

- `FastPay/lib/assistant` (on-device TS)
- `fastpay-backend/apps/assistant-service` (Nest cloud path)

This package mirrors the 4-phase ML plan for local regression: golden-set eval, CLI smoke tests, feedback export. It is **not** called from the app or Nest at request time.

1. Pipeline correctness — retrieval confidence, gated orchestrator, answer validator, cloud escalation  
2. Understanding — centroid intent + regex fallback, entity extraction  
3. Personal financial intelligence — user profile / risk flags, action ranker  
4. Learning loop — feedback store, turn audit, eval harness, feedback report  

No native ML deps.

## Layout

```
fastpay_assistant/
  ml/           config, classifier, entities, validator, profile, ranker
  rag/          BM25, retriever, template replies
  orchestrator.py
  intent_router.py
  fast_answers.py
  escalation.py
  feedback.py
  cli.py
data/
  sample_corpus.json
  golden_set.json
scripts/
  eval_assistant.py
  export_feedback_report.py
```

## Commands

```bash
cd fastpay-assistant-ml
pip install -e ".[dev]"

# Smoke / demo
python -m fastpay_assistant.cli "how much do i have"
python -m fastpay_assistant.cli "can i afford 50000" --json
python -m fastpay_assistant.cli "help me save more" --mode connected --online

# Unit tests
python -m pytest -q

# Golden set eval (intent + mustInclude / mustNotInclude)
python scripts/eval_assistant.py
python scripts/eval_assistant.py --json
python scripts/eval_assistant.py --min-pass 0.8

# Feedback → corpus fix report
python scripts/export_feedback_report.py
python scripts/export_feedback_report.py --out feedback-report.json
```

## Cloud escalation (reference)

```python
from fastpay_assistant.escalation import should_escalate_to_cloud

if should_escalate_to_cloud(local_reply):
    # Connected client should POST /assistant/chat
    ...
```

When porting thresholds into TS, keep `fastpay_assistant/ml/config.py` in sync and re-run `python scripts/eval_assistant.py`.

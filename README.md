# FastPay

Monorepo for the FastPay fintech wallet.

```
Fast/
├── fastpay-backend/        # NestJS microservices + MongoDB
├── fastpay_mobile/         # Flutter mobile app (iOS + Android) — primary mobile client
├── fastpay-web/            # Marketing landing site (Vite + React)
├── FastPay/                # Legacy Expo/RN app (web prototyping)
└── fastpay-assistant-ml/   # Python offline eval brain (assistant golden set / CLI)
```

### Marketing site

```bash
cd fastpay-web
npm install
npm run dev   # http://localhost:5173
```

### Security (docs + services)

```bash
# Start audit-service (Security Center API)
cd fastpay-backend && npm run start:audit

# Docs
docs/security/stride-payment-flow.md
docs/security/security-center-api.md
docs/security/network-edge.md   # CDN, WAF, TLS, NetworkPolicies, rate limits
```

## Quick start

### Option A — npm (local dev)

```bash
# Backend
cd fastpay-backend
npm run docker:up
npm run start:auth
npm run start:gateway
npm run start:payment
npm run start:blockchain

# Expo app (physical device)
cd FastPay
cp .env.example .env   # set EXPO_PUBLIC_API_URL to your PC's LAN IP
npm run start
```

### Option B — local Kubernetes

```bash
cd fastpay-backend 
# Enable K8s in Docker Desktop, then:
./infrastructure/k8s/scripts/setup-ingress.ps1   # one-time
./infrastructure/k8s/scripts/deploy-local.ps1
# Gateway: http://localhost:30000/health (or port-forward to :3000)
```

See `fastpay-backend/README.md` for full K8s docs.

### Phone can't reach API?

1. Phone and PC must be on the **same Wi‑Fi** (not mobile data).
2. On your phone browser, open `http://<pc-ip>:3000/health` — should show `{"status":"ok"}`.
3. If that fails, allow port 3000 through Windows Firewall (run PowerShell **as Administrator**):

```powershell
netsh advfirewall firewall add rule name="FastPay API Gateway 3000" dir=in action=allow protocol=TCP localport=3000
```

4. Restart Expo after changing `.env`: `npm run start -- --clear`

## Assistant ML (Python offline eval)

Runtime assistant lives in `FastPay` (TS) + `fastpay-backend/apps/assistant-service` (Nest).  
`fastpay-assistant-ml` is the **offline eval brain** — golden-set regression, CLI smoke tests, feedback reports. Not on the request path.

```bash
cd fastpay-assistant-ml
pip install -e ".[dev]"

# Interactive smoke test
python -m fastpay_assistant.cli "how much do i have"
python -m fastpay_assistant.cli "can i afford 50000" --json
python -m fastpay_assistant.cli "help me save more" --mode connected --online

# Unit tests
python -m pytest -q

# Golden set (intent + mustInclude / mustNotInclude; target pass rate >= 80%)
python scripts/eval_assistant.py
python scripts/eval_assistant.py --json
python scripts/eval_assistant.py --min-pass 0.8

# Aggregate downvoted turns for corpus fixes (after local feedback exists)
python scripts/export_feedback_report.py
python scripts/export_feedback_report.py --out feedback-report.json
```

See `fastpay-assistant-ml/README.md` for package layout and thresholds.

### Assistant quality ops loop

When routing or corpus changes:

```bash
# 1. Edit corpus or intent exemplars (TS: FastPay/lib/assistant/ml/intent-exemplars.ts)
cd fastpay-backend && npm run corpus:build && npm run corpus:sync

# 2. Rebuild cloud embeddings (assistant-service running)
curl -X POST http://localhost:3016/assistant/index/rebuild -H "Content-Type: application/json" -d "{\"secret\":\"dev-index-secret\"}"

# 3. Regression gate (Python offline eval brain)
cd fastpay-assistant-ml && python scripts/eval_assistant.py --min-pass 0.8

# 4. Review downvoted turns → fix static.json / exemplars
python scripts/export_feedback_report.py
```

See each folder's README for details.

# FastPay

Monorepo for the FastPay fintech wallet.

```
Fast/
├── fastpay-backend/   # NestJS microservices + MongoDB
├── fastpay_mobile/    # Flutter mobile app (iOS + Android) — primary mobile client
└── FastPay/           # Legacy Expo/RN app (web prototyping)
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

See each folder's README for details.

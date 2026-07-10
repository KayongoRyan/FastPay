# FastPay

Monorepo for the FastPay fintech wallet.

```
Fast/
├── fastpay-backend/   # NestJS microservices + MongoDB
├── fastpay_mobile/    # Flutter mobile app (iOS + Android) — primary mobile client
└── FastPay/           # Legacy Expo/RN app (web prototyping)
```

## Quick start

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

### Phone can't reach API?

1. Phone and PC must be on the **same Wi‑Fi** (not mobile data).
2. On your phone browser, open `http://<pc-ip>:3000/health` — should show `{"status":"ok"}`.
3. If that fails, allow port 3000 through Windows Firewall (run PowerShell **as Administrator**):

```powershell
netsh advfirewall firewall add rule name="FastPay API Gateway 3000" dir=in action=allow protocol=TCP localport=3000
```

4. Restart Expo after changing `.env`: `npm run start -- --clear`

See each folder's README for details.

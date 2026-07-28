# FastPay Golden Path

End-to-end flow that proves the product works: **register → login → wallet → transfer → history**.

## HTTP sequence (via gateway `:3000`)

| Step | Method | Path | Service |
|------|--------|------|---------|
| 1 | POST | `/auth/register` | auth-service |
| 2 | POST | `/auth/login` | auth-service |
| 3 | GET | `/wallet/me` | wallet-service (JWT) |
| 4 | POST | `/wallet/me/transfer` | wallet-service (JWT) |
| 5 | GET | `/offline/relay/:txHash` | payment-service |
| 6 | GET | `/wallet/me/history` | wallet-service (JWT) |

Alternative low-level Stellar path (mobile / debugging):

- `POST /stellar/accounts` — create funded test account
- `POST /stellar/transactions/payment` — build signed XDR
- `POST /offline/relay` — queue + broadcast
- `GET /payments/history/:publicKey` — relay-sourced history

## Local verification

```bash
cd fastpay-backend
npm run docker:up
npm run start:auth          # :3001
npm run start:wallet        # :3002
npm run start:payment       # :3003  (FASTPAY_INLINE_OFFLINE_QUEUE=true)
npm run start:blockchain    # :3009
npm run start:gateway       # :3000
npm run golden:smoke
```

## Exit criteria

- Register auto-provisions a Stellar wallet linked to the user
- `GET /wallet/me` returns balance and account number
- Transfer debits and appears in `GET /wallet/me/history` within 60s
- `npm run golden:smoke` passes with all services running

## Clients

| Client | Role |
|--------|------|
| **fastpay-web** `/app` | Web wallet wired to `/wallet/*` |
| **FastPay (Expo)** | Demo path + offline Stellar sign/relay |
| **fastpay_mobile (Flutter)** | Production mobile — port Stellar/KYC from Expo |

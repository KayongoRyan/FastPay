# Expo Golden Path — Device QA

Manual E2E script for **FastPay (Expo)** against staging or local gateway.

## Prerequisites

- Backend: `npm run docker:up` + gateway `:3000`, auth, wallet, payment, blockchain
- Set `EXPO_PUBLIC_API_URL` to gateway (e.g. `http://192.168.x.x:3000` on device)
- Physical device or emulator with network to host

## Test script

| # | Step | Expected |
|---|------|----------|
| 1 | Register new account | 201, JWT returned |
| 2 | Complete PIN setup | PIN stored locally |
| 3 | Open home — wallet loads | Balance from `GET /wallet/me` |
| 4 | KYC wizard (if prompted) | Status updates via `/kyc/status` |
| 5 | Offline send: destination + amount → Prepare QR | Signed XDR in QR JSON |
| 6 | Second device / web: Offline receive → scan QR → Relay | `accepted: true`, queueId |
| 7 | Poll relay status | `confirmed` within ~120s |
| 8 | Wallet history | Transfer appears in list |

## Quick commands

```bash
# Terminal 1 — backend
cd fastpay-backend
npm run docker:up
npm run start:gateway
npm run start:auth
npm run start:wallet
npm run start:payment
npm run start:blockchain

# Terminal 2 — Expo
cd FastPay
EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:3000 npx expo start
```

## Pass criteria

- Register → see real balance (not mock)
- One offline QR relay completes with `confirmed` status
- History shows the outbound transfer
- No unhandled API errors in Metro logs

## Known deferrals

- Web3Auth MPC, BLE/NFC, WalletConnect — post-MVP

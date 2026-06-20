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

# Flutter mobile
cd fastpay_mobile
flutter run
```

See each folder's README for details.

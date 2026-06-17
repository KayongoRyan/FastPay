# FastPay Wallet

Non-custodial crypto wallet for web, iOS, and Android — built with Expo and React Native Web.

## Goals

- Create and import wallets (seed phrase)
- Send and receive crypto
- View balances and transaction history
- Connect to dApps via WalletConnect

## Getting started

```bash
npm install
npm run start-web   # web
npm start           # mobile (Expo Go)
```

## Project structure

```
FastPay/           # This app (Expo / React Native)
  app/             # Expo Router screens
  store/           # Wallet state (Zustand)
  lib/             # Wallet core (keys, API clients, compliance)

../fastpay-backend/   # Backend monorepo (separate folder)
  apps/            # Microservices (api-gateway, payment-service, etc.)
  libs/            # Shared MongoDB module
  infrastructure/  # Docker (Mongo, Redis, mock Horizon)
```

Backend API default: `http://localhost:3000` (api-gateway)

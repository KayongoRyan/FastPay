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
app/           # Expo Router screens
components/    # Shared UI
store/         # Wallet state (Zustand)
lib/           # Wallet core logic (keys, chains, RPC)
```

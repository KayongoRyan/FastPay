# FastPay Backend Monorepo

Microservices backend for FastPay. **MongoDB** is the primary database.

## Structure

```
fastpay-backend/
├── apps/                    # Independent services
│   ├── api-gateway/         # Entry point (port 3000)
│   ├── auth-service/
│   ├── wallet-service/
│   ├── payment-service/     # Offline relay + MongoDB
│   ├── blockchain-service/  # Stellar / Horizon
│   ├── fraud-service/       # Compliance / Chainalysis mock
│   └── ...                  # family, escrow, merchant, etc.
├── libs/
│   ├── common/              # Shared health controllers
│   └── mongo/               # Mongoose connection module
├── infrastructure/
│   ├── docker/              # Mongo, Redis, mock Horizon
│   ├── k8s/
│   └── mongo/
├── contracts/
├── deployments/
├── docs/
└── tests/
```

## Quick start

```bash
# Infrastructure
npm run docker:up

# Install
npm install

# Core services (separate terminals)
npm run start:blockchain   # :3009
npm run start:fraud        # :3011
npm run start:payment      # :3003
npm run start:gateway      # :3000
```

## MongoDB collections

Canonical schemas: `libs/schemas/` — see `docs/schema/er-diagram.md`.

| Collection | Service |
|------------|---------|
| `users` | auth-service |
| `wallets` | wallet-service |
| `transactions`, `offline_relay` | payment-service |
| `families`, `family_members`, `family_savings_goals`, `savings_contributions`, `approval_requests` | family-service |
| `kyc_documents` | kyc-service |
| `audit_logs` | audit-service |

## API routes (via gateway :3000)

| Path | Service |
|------|---------|
| `/stellar/*` | blockchain-service |
| `/offline/*` | payment-service |
| `/compliance/*` | fraud-service |

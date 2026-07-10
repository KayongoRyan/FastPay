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
# Install
npm install

# Infrastructure (recommended — persistent Mongo + Redis)
npm run docker:up

# Core services (separate terminals)
npm run start:auth          # :3001
npm run start:blockchain   # :3009
npm run start:fraud        # :3011
npm run start:payment      # :3003
npm run start:gateway      # :3000
```

### MongoDB connection errors (`ECONNREFUSED :27018`)

Auth-service expects MongoDB on **localhost:27018** (Docker maps `mongo:27017` → host `27018`).

1. **Preferred:** Start **Docker Desktop**, then run `npm run docker:up`.
2. **No Docker:** `start:auth` auto-starts **in-memory MongoDB** on `:27018` and **in-memory Redis** on `:6380` when Docker services are down (data is lost when the process exits).

Force in-memory Mongo: `FASTPAY_MEMORY_MONGO=true npm run start:auth`  
Require Docker Mongo only: `FASTPAY_USE_DOCKER_MONGO=true npm run start:auth`

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
| `/auth/*` | auth-service |

### Auth endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login (rate-limited, lockout after 5 failures) |
| POST | `/auth/refresh` | Rotate tokens |
| POST | `/auth/logout` | Invalidate refresh token (Bearer required) |
| POST | `/auth/biometric/enroll` | Enable/disable biometric flag |
| GET | `/auth/me` | Current user profile |

Audit events are written to `audit_logs` on register, login, refresh, logout, and biometric enroll.

| Path | Service |
|------|---------|
| `/stellar/*` | blockchain-service |
| `/offline/*`, `/payments/*`, `/momo/*` | payment-service |
| `/wallet/*` | wallet-service |
| `/family/*` | family-service |
| `/escrow/*` | escrow-service |
| `/merchant/*` | merchant-service |
| `/treasury/*` | treasury-service |
| `/compliance/*` | fraud-service |
| `/kyc/*` | kyc-service |

## Local Kubernetes (Docker Desktop)

Full stack in-cluster: MongoDB, Redis, RabbitMQ, mock Horizon, gateway + all services.

### Prerequisites

1. Enable **Kubernetes** in Docker Desktop
2. Install ingress (one-time): `./infrastructure/k8s/scripts/setup-ingress.ps1`
3. Optional hosts entry: `127.0.0.1 api.fastpay.local`

### Deploy

```powershell
cd fastpay-backend
npm run docker:build
./infrastructure/k8s/scripts/deploy-local.ps1
# or: npm run k8s:deploy (after image build)
```

### Access

| Endpoint | URL |
|----------|-----|
| Gateway (NodePort) | `http://localhost:30000/health` |
| Gateway (port-forward) | `./infrastructure/k8s/scripts/port-forward-gateway.ps1` → `:3000` |
| Ingress | `http://api.fastpay.local/health` |
| RabbitMQ UI | `kubectl port-forward -n fastpay svc/rabbitmq 15672:15672` (fastpay/fastpay) |

Point Flutter/Expo `API_URL` to your PC IP on port **30000** (NodePort) or **3000** (port-forward).

### Teardown

```powershell
./infrastructure/k8s/scripts/teardown-local.ps1
```

### Messaging (phase 2)

RabbitMQ is deployed and `RABBITMQ_URL` is wired in ConfigMap. Offline relay still uses BullMQ on Redis — see `docs/messaging-phase2.md`.

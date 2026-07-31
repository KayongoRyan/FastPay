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

# Infrastructure (recommended — secured Mongo + Redis)
npm run mongo:certs   # first time only — TLS CA + server cert
npm run docker:up

# Core services (separate terminals)
npm run start:auth          # :3001
npm run start:blockchain   # :3009
npm run start:fraud        # :3011
npm run start:payment      # :3003
npm run start:gateway      # :3000
```

### MongoDB connection errors (`ECONNREFUSED :27018`)

Auth-service expects **secured** MongoDB on **localhost:27018** (SCRAM + TLS) when Docker is running.

1. Copy `.env.example` → `.env` and set `MONGO_*` passwords.
2. Run `npm run mongo:certs` then `npm run docker:up`.
3. **No Docker:** use **shared in-memory MongoDB** (all services share one DB on `:27019`):

```bash
# Windows: prefer Docker memory profile (native mongodb-memory-server often fails)
npm run docker:memory           # detached — all services auto-connect
npm run mongo:verify:memory

# Linux/macOS: native in-memory (keep terminal open)
npm run mongo:memory
npm run mongo:verify:memory
```

Or let the first service auto-start memory Mongo (default when Docker `:27018` is down):

```bash
npm run start:auth   # spawns shared in-memory rs0 on :27019 if needed
```

**Stale state / 90s timeout:** if `.fastpay/memory-mongo.json` points at a dead process:

```powershell
npm run mongo:memory:stop
npm run docker:memory          # Windows
npm run mongo:verify:memory
```

See [`docs/security/mongo.md`](../docs/security/mongo.md) for RBAC users, backups, and K8s secrets.

| Mode | Command / env |
|------|----------------|
| Docker (persistent, SCRAM+TLS) | `npm run docker:up` |
| Shared in-memory (ephemeral, rs0) | `npm run mongo:memory` or `npm run docker:memory` (Windows) |
| Force in-memory over Docker | `FASTPAY_MEMORY_MONGO=true` |
| Memory only (fail if not running) | `FASTPAY_MEMORY_MONGO=only` |
| Require Docker only | `FASTPAY_USE_DOCKER_MONGO=true` |
| Stop in-memory / clear stale state | `npm run mongo:memory:stop` |

### Docker Desktop troubleshooting

Symptoms: `500 Internal Server Error` on `dockerDesktopLinuxEngine`, compose can't pull images, engine stuck on **Starting the Docker Engine** with RAM 0.00 GB.

1. Quit Docker Desktop (tray → Quit)
2. Admin PowerShell: `wsl --shutdown`
3. Reopen Docker Desktop; wait for **Engine running**
4. Verify: `docker version` shows **Client and Server**
5. Still broken: Settings → Troubleshoot → Restart; last resort → Clean/Purge data

Disable **Kubernetes** in Docker settings if the engine won't start (enable later for K8s deploy).

### Wallet `ECONNREFUSED :3009` / `fetch failed`

`wallet-service` provisions Stellar accounts via `blockchain-service` (:3009), which funds via mock Horizon friendbot (:8090).

Start **in this order** (separate terminals):

```powershell
# 1. Mock Horizon (Docker or native)
docker start fastpay-mock-horizon    # or: npm run mock:horizon

# 2. Blockchain (required before wallet)
npm run start:blockchain             # :3009

# 3. Wallet
npm run start:wallet                 # :3002
```

Verify: `curl.exe -s http://localhost:3009/health` and `curl.exe -s "http://localhost:8090/friendbot?addr=GTEST"` both succeed.

Host `mongosh`:

```powershell
mongosh "mongodb://fastpay_app:YOUR_PASSWORD@localhost:27018/FastPay?authSource=FastPay&tls=true" `
  --tlsCAFile infrastructure/mongo/certs/ca.crt
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
| `/auth/*` | auth-service |

### Auth endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/register/merchant` | Register merchant org + owner |
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

1. Docker Desktop **engine running** (`docker version` shows Server)
2. Enable **Kubernetes** in Docker Desktop (use **Docker Desktop** provisioner unless you need kind)
3. Install ingress (one-time): `./infrastructure/k8s/scripts/setup-ingress.ps1`
4. Optional hosts entry: `127.0.0.1 api.fastpay.local`
5. Generate TLS assets: `npm run mongo:certs` (synced into overlay by `k8s:deploy`)

### Deploy

```powershell
cd fastpay-backend
npm run docker:build
npm run docker:scan          # optional; fails on CRITICAL CVEs
npm run k8s:deploy           # syncs certs + applies overlays/local

# One-shot (build, kind load if needed, apply, wait for rollouts):
# ./infrastructure/k8s/scripts/deploy-local.ps1

# After first deploy — Mongo replica set + app users (jobs are not all in k8s:deploy):
kubectl wait --for=condition=complete job/mongo-init-rs -n fastpay --timeout=300s
kubectl apply -f infrastructure/k8s/base/data/mongo-init-users-job.yaml
kubectl wait --for=condition=complete job/mongo-init-users -n fastpay --timeout=300s

npm run k8s:status
```

**kind clusters:** run `npm run k8s:load` after `docker:build` so nodes can pull `fastpay-backend:local`.

**App pods `ErrImageNeverPull`:** run `npm run docker:build` (image must exist locally with `imagePullPolicy: Never`).

**Mongo pods stuck:** ensure `mongo-tls` / `mongo-keyfile` secrets exist in namespace `fastpay` (local overlay must set `namespace: fastpay` for cert secrets).

### Container security

Images run as **non-root** (`node`, UID 1000) with production-only dependencies in the runtime layer. Base image is pinned by digest in [`Dockerfile`](Dockerfile).

Before deploy:

```powershell
npm run docker:build
npm run docker:scan   # fails on CRITICAL CVEs; writes SBOM to infrastructure/docker/sbom/
```

Refresh base digest when upgrading Node:

```powershell
docker inspect node:20-alpine --format "{{index .RepoDigests 0}}"
# Update both FROM lines in Dockerfile
```

K8s app pods use `readOnlyRootFilesystem`, drop all capabilities, and mount `/tmp` as `emptyDir` for Node runtime temp files.

**Production follow-up:** push to a private registry (GHCR/ECR), deploy by image digest (not `:latest`), and use `imagePullSecrets`.

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

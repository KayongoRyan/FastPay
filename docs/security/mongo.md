# MongoDB security (self-hosted)

FastPay runs **MongoDB 7 Community** as a **3-member replica set (`rs0`)** with **SCRAM authentication**, **TLS in transit**, **Kubernetes Secrets** for credentials, **NetworkPolicies** restricting DB access, **daily mongodump backups**, **restore scripts**, and optional **Mongo Express** (read-only UI). Application audit events continue via `audit-service`.

## Threat model

| Risk | Control |
|------|---------|
| Anonymous access | SCRAM users; `--auth` via `mongod.conf` |
| Credential leak in git | Passwords in `.env` / K8s Secrets only |
| MITM on wire | `requireTLS` + CA mounted in apps |
| Public DB exposure | Docker: `:27018` on localhost only; K8s: headless ClusterIP, no NodePort |
| Single node failure | 3-member replica set with automatic primary election |
| Lateral movement | NetworkPolicy: only `fastpay.io/mongo-client` pods + backup job |
| Data loss | Daily CronJob `mongodump` + local `npm run mongo:backup` + tested restore |

## RBAC users

| User | Database | Roles | Used by |
|------|----------|-------|---------|
| `fastpay_root` | `admin` | `root` | Bootstrap / break-glass |
| `fastpay_app` | `FastPay` | `readWrite` | All Nest services |
| `fastpay_backup` | `FastPay` | `backup`, `read` | Backup CronJob / `mongodump` |
| `fastpay_ro` | `FastPay` | `read` | Ops / Mongo Express (read-only UI) |

**Services must use `fastpay_app` only** — never put root credentials in `MONGODB_URI`.

Connection string pattern (Docker — apps on host use `directConnection=true`):

```text
mongodb://fastpay_app:PASSWORD@127.0.0.1:27018/FastPay?authSource=FastPay&replicaSet=rs0&directConnection=true
```

Kubernetes (in-cluster):

```text
mongodb://fastpay_app:PASSWORD@mongo-0.mongo:27017,mongo-1.mongo:27017,mongo-2.mongo:27017/FastPay?authSource=FastPay&replicaSet=rs0
```

TLS options (Node/Mongoose):

```env
MONGODB_TLS=true
MONGODB_TLS_CA_FILE=infrastructure/mongo/certs/ca.crt
```

## Local Docker setup

1. Copy env and set passwords:

   ```powershell
   cd fastpay-backend
   copy .env.example .env
   ```

2. Generate TLS certs + replica-set keyfile (uses Node — no OpenSSL required):

   ```powershell
   npm install
   npm run mongo:certs
   ```

3. Start stack (single-node replica set for local dev + auto `rs.initiate`):

   ```powershell
   npm run docker:up
   ```

   Docker uses **1 mongo node** (`rs0`) for transactions. **3-node HA** is configured in Kubernetes.

4. Verify:

   ```powershell
   npm run mongo:verify
   ```

5. Optional read-only admin UI:

   ```powershell
   npm run docker:tools
   # http://localhost:8081  (basic auth from MONGO_EXPRESS_* in .env)
   ```

### Migrating from single-node Mongo (old `fastpay-mongo-data` volume)

Wipe old volumes and recreate the replica set:

```powershell
docker compose --env-file .env -f infrastructure/docker/docker-compose.yml down -v
npm run mongo:certs -- --force
npm run docker:up
npm run mongo:verify
```

## Kubernetes

### Prerequisites

1. Generate certs + keyfile on the deploy machine: `npm run mongo:certs`
2. Local overlay builds `mongo-tls` and `mongo-keyfile` Secrets via kustomize `secretGenerator`.
3. Apply secrets with mongo credentials (`overlays/local/secrets.yaml` for dev).

```powershell
npm run k8s:deploy
kubectl apply -f infrastructure/k8s/base/data/mongo-init-rs-job.yaml
kubectl apply -f infrastructure/k8s/base/data/mongo-init-users-job.yaml
```

### Production secrets

Use `infrastructure/k8s/overlays/production/secrets.example.yaml` as a template. Store real values in your secret manager or:

```bash
kubectl create secret generic fastpay-secrets --from-env-file=prod.env -n fastpay
kubectl create secret generic mongo-tls \
  --from-file=ca.crt=infrastructure/mongo/certs/ca.crt \
  --from-file=server.pem=infrastructure/mongo/certs/server.pem \
  -n fastpay
kubectl create secret generic mongo-keyfile \
  --from-file=keyfile=infrastructure/mongo/certs/keyfile \
  -n fastpay
```

`MONGODB_URI` lives in **Secret**, not ConfigMap. Non-secret flags (`MONGODB_TLS`, `MONGODB_TLS_CA_FILE`) stay in `fastpay-config`.

### Init users on existing PVC

If the StatefulSet PVC predates auth:

```bash
kubectl apply -f infrastructure/k8s/base/data/mongo-init-users-job.yaml
```

## Backups & restore

| Environment | Mechanism |
|-------------|-----------|
| Docker | `npm run mongo:backup` → `infrastructure/mongo/backups/dump-*` |
| K8s | CronJob `mongo-backup` daily 02:00 UTC → PVC `mongo-backups` (keeps last 7 dumps) |

### Restore (Docker)

```powershell
# List backups in infrastructure/mongo/backups/
npm run mongo:restore -- -Latest -Force
# Or: npm run mongo:restore -- -BackupPath infrastructure\mongo\backups\dump-YYYYMMDD-HHMMSS -Force
npm run mongo:verify
```

Uses `mongorestore --drop` against the `FastPay` database on primary `fastpay-mongo` (mongo-0).

## Encryption at rest

**MongoDB Community does not support WiredTiger encryption-at-rest.** Use:

- **Cloud:** encrypted block storage on the PVC (e.g. EBS gp3 with encryption, Azure encrypted disks).
- **Local Docker:** rely on host disk encryption (BitLocker / FileVault) for `fastpay-mongo-data`.
- **Upgrade path:** MongoDB Enterprise or Atlas for native E@R.

Set an encrypted `storageClassName` on the mongo volumeClaimTemplate in production.

## Audit

| Layer | Status |
|-------|--------|
| App events (login, password change, payments) | `audit-service` → `audit_logs` collection |
| MongoDB native `auditLog` | **Enterprise / Atlas only** — not in Community |
| Auth failures | Elevated `accessControl` log verbosity in `mongod.conf` |
| Backup operations | CronJob logs success/failure |

## File map

| Path | Purpose |
|------|---------|
| `infrastructure/mongo/mongod.conf` | TLS + auth + replica set config |
| `infrastructure/mongo/scripts/gen-certs.mjs` | Dev CA, server cert, RS keyfile |
| `infrastructure/mongo/init/01-users.js` | Docker mongo-0 first-boot RBAC |
| `infrastructure/mongo/scripts/init-replica-set.sh` | Docker Compose rs.initiate job |
| `infrastructure/mongo/scripts/restore-local.*` | mongorestore helper |
| `infrastructure/k8s/base/data/mongo-*` | K8s StatefulSet (×3), backup, init jobs |
| `libs/mongo/` | Mongoose TLS + URI resolution |

## Related

- [Network edge & policies](./network-edge.md)
- [Security center API](./security-center-api.md)

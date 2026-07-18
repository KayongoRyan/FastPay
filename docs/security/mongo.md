# MongoDB security (self-hosted)

FastPay runs **MongoDB 7 Community** with **SCRAM authentication**, **TLS in transit**, **Kubernetes Secrets** for credentials, **NetworkPolicies** restricting DB access, **daily mongodump backups**, and **RBAC users**. Application audit events continue via `audit-service`.

## Threat model

| Risk | Control |
|------|---------|
| Anonymous access | SCRAM users; `--auth` via `mongod.conf` |
| Credential leak in git | Passwords in `.env` / K8s Secrets only |
| MITM on wire | `requireTLS` + CA mounted in apps |
| Public DB exposure | Docker: `:27018` on localhost only; K8s: ClusterIP, no NodePort |
| Lateral movement | NetworkPolicy: only `fastpay.io/mongo-client` pods + backup job |
| Data loss | Daily CronJob `mongodump` + local `npm run mongo:backup` |

## RBAC users

| User | Database | Roles | Used by |
|------|----------|-------|---------|
| `fastpay_root` | `admin` | `root` | Bootstrap / break-glass |
| `fastpay_app` | `FastPay` | `readWrite` | All Nest services |
| `fastpay_backup` | `FastPay` | `backup`, `read` | Backup CronJob / `mongodump` |
| `fastpay_ro` | `FastPay` | `read` | Ops / debugging |

**Services must use `fastpay_app` only** — never put root credentials in `MONGODB_URI`.

Connection string pattern:

```text
mongodb://fastpay_app:PASSWORD@HOST:PORT/FastPay?authSource=FastPay
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

2. Generate TLS certs (uses Node — no OpenSSL required):

   ```powershell
   npm install
   npm run mongo:certs
   ```

3. Start stack:

   ```powershell
   npm run docker:up
   ```

4. Verify:

   ```powershell
   mongosh "mongodb://fastpay_app:YOUR_APP_PASSWORD@localhost:27018/FastPay?authSource=FastPay&tls=true" `
     --tlsCAFile infrastructure/mongo/certs/ca.crt
   ```

### Migrating from open Mongo (existing volume)

If you already had unauthenticated data on `fastpay-mongo-data`:

```powershell
# Option A — wipe and start fresh
npm run mongo:migrate-auth -- -WipeVolume
npm run mongo:certs
npm run docker:up

# Option B — create users on open instance, then enable TLS
npm run mongo:migrate-auth
```

## Kubernetes

### Prerequisites

1. Generate certs on the deploy machine: `npm run mongo:certs`
2. Local overlay builds `mongo-tls` Secret from `infrastructure/mongo/certs/` via kustomize `secretGenerator`.
3. Apply secrets with mongo credentials (`overlays/local/secrets.yaml` for dev).

```powershell
npm run k8s:deploy
```

### Production secrets

Use `infrastructure/k8s/overlays/production/secrets.example.yaml` as a template. Store real values in your secret manager or:

```bash
kubectl create secret generic fastpay-secrets --from-env-file=prod.env -n fastpay
kubectl create secret generic mongo-tls \
  --from-file=ca.crt=infrastructure/mongo/certs/ca.crt \
  --from-file=server.pem=infrastructure/mongo/certs/server.pem \
  -n fastpay
```

`MONGODB_URI` lives in **Secret**, not ConfigMap. Non-secret flags (`MONGODB_TLS`, `MONGODB_TLS_CA_FILE`) stay in `fastpay-config`.

### Init users on existing PVC

If the StatefulSet PVC predates auth:

```bash
kubectl apply -f infrastructure/k8s/base/data/mongo-init-users-job.yaml
```

## Backups

| Environment | Mechanism |
|-------------|-----------|
| Docker | `npm run mongo:backup` → `infrastructure/mongo/backups/dump-*` |
| K8s | CronJob `mongo-backup` daily 02:00 UTC → PVC `mongo-backups` (keeps last 7 dumps) |

### Restore (Docker example)

```powershell
docker cp infrastructure/mongo/backups/dump-YYYYMMDD-HHMMSS fastpay-mongo:/tmp/restore
docker exec fastpay-mongo mongorestore `
  --host localhost --port 27017 `
  --username fastpay_backup --password YOUR_BACKUP_PASSWORD `
  --authenticationDatabase FastPay `
  --tls --tlsCAFile /etc/mongo/tls/ca.crt --tlsAllowInvalidHostnames `
  --db FastPay /tmp/restore/FastPay
```

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
| `infrastructure/mongo/mongod.conf` | TLS + auth config |
| `infrastructure/mongo/scripts/gen-certs.*` | Dev CA + server cert |
| `infrastructure/mongo/init/01-users.sh` | Docker first-boot RBAC |
| `infrastructure/k8s/base/data/mongo-*` | K8s config, StatefulSet, backup |
| `libs/mongo/` | Mongoose TLS + URI resolution |

## Related

- [Network edge & policies](./network-edge.md)
- [Security center API](./security-center-api.md)

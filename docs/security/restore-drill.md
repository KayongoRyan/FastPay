# Mongo restore drill

Quarterly drill to verify backups are restorable.

## Prerequisites

- Local Mongo via `npm run docker:up`
- At least one backup in `fastpay-backend/infrastructure/mongo/backups/`

## Steps

1. **Create test data**

```bash
cd fastpay-backend
npm run golden:smoke -- --skip-mongo
```

2. **Take backup**

```bash
npm run mongo:backup
```

3. **Simulate data loss** — stop Mongo and remove the data volume (dev only):

```powershell
docker compose -f infrastructure/docker/docker-compose.yml down
# Remove volume named fastpay_mongo_data (Docker Desktop → Volumes)
docker compose -f infrastructure/docker/docker-compose.yml up -d
npm run mongo:verify
```

4. **Restore**

```powershell
npm run mongo:restore
npm run mongo:verify
```

5. **Verify application**

- Re-run `npm run golden:smoke -- --skip-mongo` OR
- Confirm `users`, `wallets`, `transactions` collections contain expected counts

## Pass criteria

- Restore completes without error
- `mongo:verify` passes (TLS, auth, RBAC)
- Golden smoke passes after restore (fresh services)

## Production notes

- Use off-site backup storage (S3 / Azure Blob) — not committed to git
- Document RTO/RPO targets in runbook
- Rotate backup encryption keys per `docs/security/mongo.md`

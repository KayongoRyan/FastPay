#!/usr/bin/env bash
# One-shot migration from open Mongo (no auth) to secured Mongo with SCRAM + TLS.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
COMPOSE="$ROOT/docker/docker-compose.yml"

if [[ "${1:-}" == "--wipe" ]]; then
  docker compose -f "$COMPOSE" down -v
  echo "Volume wiped. Run: npm run mongo:certs && npm run docker:up"
  exit 0
fi

if ! docker exec fastpay-mongo mongosh --quiet --eval "db.adminCommand('ping')" &>/dev/null; then
  echo "fastpay-mongo not running. Run: npm run docker:up"
  exit 1
fi

if [[ -z "${MONGO_APP_PASSWORD:-}" ]]; then
  echo "Set passwords in fastpay-backend/.env (see .env.example), then re-run."
  exit 1
fi

echo "Creating RBAC users on open instance ..."
docker exec fastpay-mongo mongosh --quiet <<EOF
use FastPay
try { db.createUser({ user: "${MONGO_APP_USER:-fastpay_app}", pwd: "$MONGO_APP_PASSWORD", roles: [{ role: "readWrite", db: "FastPay" }] }) } catch (e) { print(e) }
try { db.createUser({ user: "${MONGO_BACKUP_USER:-fastpay_backup}", pwd: "$MONGO_BACKUP_PASSWORD", roles: [{ role: "backup", db: "FastPay" }, { role: "read", db: "FastPay" }] }) } catch (e) { print(e) }
try { db.createUser({ user: "${MONGO_RO_USER:-fastpay_ro}", pwd: "$MONGO_RO_PASSWORD", roles: [{ role: "read", db: "FastPay" }] }) } catch (e) { print(e) }
use admin
try { db.createUser({ user: "${MONGO_INITDB_ROOT_USERNAME:-fastpay_root}", pwd: "$MONGO_INITDB_ROOT_PASSWORD", roles: ["root"] }) } catch (e) { print(e) }
EOF

"$(dirname "$0")/gen-certs.sh"
docker compose -f "$COMPOSE" up -d --force-recreate mongo
echo "Migration complete."

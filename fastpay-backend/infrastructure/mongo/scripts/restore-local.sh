#!/usr/bin/env bash
# Restore FastPay database from a mongodump directory (requires fastpay-mongo running).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
BACKUP_ROOT="$ROOT/infrastructure/mongo/backups"
CERT="$ROOT/infrastructure/mongo/certs/ca.crt"
LATEST=false
FORCE=false
BACKUP_PATH=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --latest) LATEST=true; shift ;;
    --force) FORCE=true; shift ;;
    --path) BACKUP_PATH="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

if [[ ! -f "$CERT" ]]; then
  echo "Run npm run mongo:certs first."
  exit 1
fi

if [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
  set +a
fi

if $LATEST; then
  BACKUP_PATH="$(find "$BACKUP_ROOT" -maxdepth 1 -type d -name 'dump-*' | sort | tail -n 1)"
fi

if [[ -z "$BACKUP_PATH" || ! -d "$BACKUP_PATH/FastPay" ]]; then
  echo "Usage: npm run mongo:restore -- [--latest] [--path dump-dir] --force"
  exit 1
fi

if ! $FORCE; then
  echo "This will DROP and restore the FastPay database on fastpay-mongo."
  echo "Re-run with --force to proceed."
  exit 1
fi

: "${MONGO_INITDB_ROOT_PASSWORD:?Set MONGO_INITDB_ROOT_PASSWORD in .env}"
ROOT_USER="${MONGO_INITDB_ROOT_USERNAME:-fastpay_root}"
REMOTE="restore-$(date +%Y%m%d-%H%M%S)"

docker cp "$BACKUP_PATH/FastPay" "fastpay-mongo:/tmp/$REMOTE"

docker exec fastpay-mongo mongorestore \
  --host localhost --port 27017 \
  --username "$ROOT_USER" \
  --password "$MONGO_INITDB_ROOT_PASSWORD" \
  --authenticationDatabase admin \
  --db FastPay \
  --drop \
  --tls --tlsCAFile /etc/mongo/tls/ca.crt --tlsAllowInvalidHostnames \
  "/tmp/$REMOTE"

docker exec fastpay-mongo rm -rf "/tmp/$REMOTE"
echo "Restore complete from $BACKUP_PATH"

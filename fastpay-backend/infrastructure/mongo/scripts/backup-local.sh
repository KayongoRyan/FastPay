#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT_DIR="${1:-$ROOT/infrastructure/mongo/backups}"
CERT="$ROOT/infrastructure/mongo/certs/ca.crt"
mkdir -p "$OUT_DIR"

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

: "${MONGO_BACKUP_PASSWORD:?Set MONGO_BACKUP_PASSWORD in .env}"
BACKUP_USER="${MONGO_BACKUP_USER:-fastpay_backup}"
STAMP=$(date +%Y%m%d-%H%M%S)
OUT="$OUT_DIR/dump-$STAMP"

docker exec fastpay-mongo mongodump \
  --host localhost --port 27017 \
  --username "$BACKUP_USER" \
  --password "$MONGO_BACKUP_PASSWORD" \
  --authenticationDatabase FastPay \
  --db FastPay \
  --tls --tlsCAFile /etc/mongo/tls/ca.crt --tlsAllowInvalidHostnames \
  --out "/tmp/dump-$STAMP"

docker cp "fastpay-mongo:/tmp/dump-$STAMP" "$OUT"
echo "Backup written to $OUT"
find "$OUT_DIR" -maxdepth 1 -type d -name 'dump-*' | sort | head -n -7 | xargs -r rm -rf

#!/bin/bash
# Runs once on empty data directory via mongo docker entrypoint.
set -euo pipefail

: "${MONGO_INITDB_ROOT_USERNAME:?MONGO_INITDB_ROOT_USERNAME required}"
: "${MONGO_INITDB_ROOT_PASSWORD:?MONGO_INITDB_ROOT_PASSWORD required}"
: "${MONGO_APP_USER:=fastpay_app}"
: "${MONGO_APP_PASSWORD:?MONGO_APP_PASSWORD required}"
: "${MONGO_BACKUP_USER:=fastpay_backup}"
: "${MONGO_BACKUP_PASSWORD:?MONGO_BACKUP_PASSWORD required}"
: "${MONGO_RO_USER:=fastpay_ro}"
: "${MONGO_RO_PASSWORD:?MONGO_RO_PASSWORD required}"

TLS_ARGS=(--tls --tlsCAFile /etc/mongo/tls/ca.crt --tlsAllowInvalidHostnames)
AUTH_ARGS=(-u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin)

mongosh "${TLS_ARGS[@]}" "${AUTH_ARGS[@]}" <<EOF
use FastPay
db.createUser({
  user: "$MONGO_APP_USER",
  pwd: "$MONGO_APP_PASSWORD",
  roles: [{ role: "readWrite", db: "FastPay" }]
})
db.createUser({
  user: "$MONGO_BACKUP_USER",
  pwd: "$MONGO_BACKUP_PASSWORD",
  roles: [
    { role: "backup", db: "FastPay" },
    { role: "read", db: "FastPay" }
  ]
})
db.createUser({
  user: "$MONGO_RO_USER",
  pwd: "$MONGO_RO_PASSWORD",
  roles: [{ role: "read", db: "FastPay" }]
})
EOF

echo "[init] Created FastPay RBAC users: $MONGO_APP_USER, $MONGO_BACKUP_USER, $MONGO_RO_USER"

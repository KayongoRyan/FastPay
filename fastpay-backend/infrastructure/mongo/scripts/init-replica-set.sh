#!/usr/bin/env bash
# Init replica set for Docker Compose (single-node local dev or 3-node HA).
set -euo pipefail

ROOT_USER="${MONGO_INITDB_ROOT_USERNAME:-fastpay_root}"
ROOT_PASS="${MONGO_INITDB_ROOT_PASSWORD:?Set MONGO_INITDB_ROOT_PASSWORD}"
RS_NAME="${MONGO_REPLICA_SET:-rs0}"
SINGLE="${MONGO_RS_SINGLE:-false}"
TLS=(--tls --tlsCAFile /etc/mongo/tls/ca.crt --tlsAllowInvalidHostnames)
AUTH=(-u "$ROOT_USER" -p "$ROOT_PASS" --authenticationDatabase admin)

wait_member() {
  local host=$1
  echo "[rs-init] Waiting for ${host}..."
  for _ in $(seq 1 90); do
    if mongosh "${TLS[@]}" "${AUTH[@]}" --host "$host" --port 27017 --eval "db.adminCommand('ping')" &>/dev/null; then
      echo "[rs-init] ${host} is up"
      return 0
    fi
    sleep 2
  done
  echo "[rs-init] Timed out waiting for ${host}" >&2
  return 1
}

wait_member mongo-0

if [[ "$SINGLE" == "true" ]]; then
  MEMBERS_JS="{ _id: 0, host: 'mongo-0:27017' }"
else
  wait_member mongo-1
  wait_member mongo-2
  MEMBERS_JS="
    { _id: 0, host: 'mongo-0:27017' },
    { _id: 1, host: 'mongo-1:27017' },
    { _id: 2, host: 'mongo-2:27017' }
  "
fi

echo "[rs-init] Ensuring replica set ${RS_NAME}..."
mongosh "${TLS[@]}" "${AUTH[@]}" --host mongo-0 --port 27017 --eval "
try {
  if (rs.status().ok === 1) { print('[rs-init] Already initiated'); quit(0); }
} catch (e) {
  rs.initiate({
    _id: '${RS_NAME}',
    members: [ ${MEMBERS_JS} ]
  });
  print('[rs-init] rs.initiate issued');
}
"

echo "[rs-init] Waiting for PRIMARY..."
for _ in $(seq 1 90); do
  if mongosh "${TLS[@]}" "${AUTH[@]}" --host mongo-0 --port 27017 --quiet --eval "rs.isMaster().ismaster" | grep -q true; then
    echo "[rs-init] Replica set ready (primary elected)."
    exit 0
  fi
  sleep 2
done

echo "[rs-init] Timed out waiting for PRIMARY" >&2
exit 1

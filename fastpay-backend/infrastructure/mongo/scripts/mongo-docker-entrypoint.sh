#!/usr/bin/env bash
# Fix keyfile permissions on bind mounts (Windows/macOS) before starting mongod.
set -euo pipefail

SRC=/etc/mongo/keyfile/keyfile
RUNTIME=/run/mongo-keyfile
CONF=/tmp/mongod.runtime.conf

if [[ -f "$SRC" ]]; then
  install -m 400 -o mongodb -g mongodb "$SRC" "$RUNTIME"
  sed "s|keyFile: /etc/mongo/keyfile/keyfile|keyFile: ${RUNTIME}|" /etc/mongod/mongod.conf > "$CONF"
else
  cp /etc/mongod/mongod.conf "$CONF"
fi

exec docker-entrypoint.sh mongod --config "$CONF"

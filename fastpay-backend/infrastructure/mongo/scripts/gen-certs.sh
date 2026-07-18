#!/usr/bin/env bash
# Generate local CA + server cert for MongoDB TLS (Docker + K8s).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
ARGS=()
if [[ "${FORCE:-0}" == "1" ]]; then
  ARGS+=(--force)
fi

cd "$ROOT"
node infrastructure/mongo/scripts/gen-certs.mjs "${ARGS[@]}"

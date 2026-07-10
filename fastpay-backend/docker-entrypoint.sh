#!/bin/sh
set -e

SERVICE="${SERVICE:-api-gateway}"
MAIN="apps/${SERVICE}/dist/apps/${SERVICE}/src/main.js"

if [ ! -f "$MAIN" ]; then
  echo "Service entrypoint not found: $MAIN"
  echo "Set SERVICE to one of: api-gateway, auth-service, wallet-service, payment-service,"
  echo "family-service, escrow-service, merchant-service, treasury-service,"
  echo "blockchain-service, fraud-service, kyc-service"
  exit 1
fi

echo "Starting ${SERVICE} -> ${MAIN}"
exec node "$MAIN"

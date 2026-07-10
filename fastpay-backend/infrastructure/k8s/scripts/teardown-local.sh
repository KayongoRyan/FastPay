#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "Removing FastPay namespace..."
kubectl delete -k "$SCRIPT_DIR/../overlays/local" --ignore-not-found
echo "Done."

#!/usr/bin/env bash
set -euo pipefail
echo "Forwarding api-gateway:3000 -> localhost:3000 (Ctrl+C to stop)"
kubectl port-forward -n fastpay svc/api-gateway 3000:3000

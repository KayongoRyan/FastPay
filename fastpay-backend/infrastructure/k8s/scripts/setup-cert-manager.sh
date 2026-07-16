#!/usr/bin/env bash
# One-time: install cert-manager + FastPay ClusterIssuers (production clusters)
set -euo pipefail

echo "Installing cert-manager v1.16.2..."
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.16.2/cert-manager.yaml

echo "Waiting for cert-manager webhook..."
kubectl wait --namespace cert-manager \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=webhook \
  --timeout=180s

echo "Applying Let's Encrypt ClusterIssuers..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
kubectl apply -f "$SCRIPT_DIR/../production/cert-manager-issuers.yaml"

echo "cert-manager ready. Certificates will be issued for hosts in the production ingress."

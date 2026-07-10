#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"

echo "Building Docker image fastpay-backend:local..."
npm run docker:build

if kubectl config current-context 2>/dev/null | grep -q '^kind-'; then
  echo "Loading image into kind cluster..."
  kind load docker-image fastpay-backend:local
fi

echo "Applying manifests (overlays/local)..."
kubectl apply -k infrastructure/k8s/overlays/local

echo "Waiting for rollouts..."
for d in mongo rabbitmq redis mock-horizon api-gateway auth-service payment-service \
  blockchain-service fraud-service kyc-service wallet-service family-service \
  escrow-service merchant-service treasury-service; do
  kubectl rollout status "deployment/$d" -n fastpay --timeout=180s 2>/dev/null || true
  kubectl rollout status "statefulset/$d" -n fastpay --timeout=180s 2>/dev/null || true
done

echo ""
echo "FastPay local stack deployed."
echo "  Gateway NodePort: http://localhost:30000/health"
echo "  Ingress (add hosts entry): http://api.fastpay.local/health"
echo "  Port-forward to :3000: infrastructure/k8s/scripts/port-forward-gateway.sh"
echo "  RabbitMQ UI: kubectl port-forward -n fastpay svc/rabbitmq 15672:15672"

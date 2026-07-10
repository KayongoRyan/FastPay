# Build image, deploy FastPay stack to local Kubernetes
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

Push-Location $Root
try {
  Write-Host "Building Docker image fastpay-backend:local..."
  npm run docker:build

  $ctx = kubectl config current-context 2>$null
  if ($ctx -match "kind-") {
    Write-Host "Loading image into kind cluster..."
    kind load docker-image fastpay-backend:local
  }

  Write-Host "Applying manifests (overlays/local)..."
  kubectl apply -k infrastructure/k8s/overlays/local

  Write-Host "Waiting for rollouts..."
  $deployments = @(
    "mongo", "rabbitmq", "redis", "mock-horizon",
    "api-gateway", "auth-service", "payment-service",
    "blockchain-service", "fraud-service", "kyc-service",
    "wallet-service", "family-service", "escrow-service",
    "merchant-service", "treasury-service"
  )
  foreach ($d in $deployments) {
    kubectl rollout status "deployment/$d" -n fastpay --timeout=180s 2>$null
    kubectl rollout status "statefulset/$d" -n fastpay --timeout=180s 2>$null
  }

  Write-Host ""
  Write-Host "FastPay local stack deployed."
  Write-Host "  Gateway NodePort: http://localhost:30000/health"
  Write-Host "  Ingress (add hosts entry): http://api.fastpay.local/health"
  Write-Host "  Port-forward to :3000: infrastructure/k8s/scripts/port-forward-gateway.ps1"
  Write-Host "  RabbitMQ UI: kubectl port-forward -n fastpay svc/rabbitmq 15672:15672"
}
finally {
  Pop-Location
}

# Forward gateway to localhost:3000 (fallback when NodePort is blocked)
$ErrorActionPreference = "Stop"
Write-Host "Forwarding api-gateway:3000 -> localhost:3000 (Ctrl+C to stop)"
kubectl port-forward -n fastpay svc/api-gateway 3000:3000

# One-time: install cert-manager + FastPay ClusterIssuers (production clusters)
$ErrorActionPreference = "Stop"

Write-Host "Installing cert-manager v1.16.2..."
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.16.2/cert-manager.yaml

Write-Host "Waiting for cert-manager webhook..."
kubectl wait --namespace cert-manager `
  --for=condition=ready pod `
  --selector=app.kubernetes.io/component=webhook `
  --timeout=180s

Write-Host "Applying Let's Encrypt ClusterIssuers..."
kubectl apply -f "$PSScriptRoot/../production/cert-manager-issuers.yaml"

Write-Host "cert-manager ready. Certificates will be issued for hosts in the production ingress."

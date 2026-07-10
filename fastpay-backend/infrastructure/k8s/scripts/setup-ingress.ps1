# One-time: install nginx ingress controller (Docker Desktop / kind)
$ErrorActionPreference = "Stop"

Write-Host "Installing nginx ingress controller..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.11.3/deploy/static/provider/cloud/deploy.yaml

Write-Host "Waiting for ingress-nginx controller..."
kubectl wait --namespace ingress-nginx `
  --for=condition=ready pod `
  --selector=app.kubernetes.io/component=controller `
  --timeout=180s

Write-Host "Ingress controller ready."

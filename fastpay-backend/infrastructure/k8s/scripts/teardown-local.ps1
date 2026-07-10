$ErrorActionPreference = "Stop"
Write-Host "Removing FastPay namespace..."
kubectl delete -k (Join-Path $PSScriptRoot "..\overlays\local") --ignore-not-found
Write-Host "Done."

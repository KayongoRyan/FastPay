# One-shot migration from open Mongo (no auth) to secured Mongo with SCRAM + TLS.
param(
  [switch]$WipeVolume
)

$ErrorActionPreference = "Stop"
$MongoRoot = Split-Path -Parent $PSScriptRoot
$BackendRoot = Split-Path -Parent $MongoRoot
$ComposeFile = Join-Path $BackendRoot "infrastructure\docker\docker-compose.yml"

Push-Location (Split-Path $ComposeFile)
try {
  if ($WipeVolume) {
    docker compose -f docker-compose.yml down -v
    Write-Host "Volume wiped. Run: npm run mongo:certs && npm run docker:up"
    exit 0
  }

  docker exec fastpay-mongo mongosh --quiet --eval "db.adminCommand('ping')" 2>$null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "fastpay-mongo not running. Run: npm run docker:up"
    exit 1
  }

  if (-not $env:MONGO_APP_PASSWORD) {
    Write-Host "Set passwords in fastpay-backend/.env (see .env.example), then re-run."
    exit 1
  }

  $appUser = if ($env:MONGO_APP_USER) { $env:MONGO_APP_USER } else { "fastpay_app" }
  $backupUser = if ($env:MONGO_BACKUP_USER) { $env:MONGO_BACKUP_USER } else { "fastpay_backup" }
  $roUser = if ($env:MONGO_RO_USER) { $env:MONGO_RO_USER } else { "fastpay_ro" }
  $rootUser = if ($env:MONGO_INITDB_ROOT_USERNAME) { $env:MONGO_INITDB_ROOT_USERNAME } else { "fastpay_root" }

  $createApp = "db.getSiblingDB('FastPay').createUser({user:'$appUser',pwd:'$($env:MONGO_APP_PASSWORD)',roles:[{role:'readWrite',db:'FastPay'}]})"
  $createBackup = "db.getSiblingDB('FastPay').createUser({user:'$backupUser',pwd:'$($env:MONGO_BACKUP_PASSWORD)',roles:[{role:'backup',db:'FastPay'},{role:'read',db:'FastPay'}]})"
  $createRo = "db.getSiblingDB('FastPay').createUser({user:'$roUser',pwd:'$($env:MONGO_RO_PASSWORD)',roles:[{role:'read',db:'FastPay'}]})"
  $createRoot = "db.getSiblingDB('admin').createUser({user:'$rootUser',pwd:'$($env:MONGO_INITDB_ROOT_PASSWORD)',roles:['root']})"

  foreach ($js in @($createApp, $createBackup, $createRo, $createRoot)) {
    docker exec fastpay-mongo mongosh --quiet --eval "try { $js } catch(e) { print(e) }" | Out-Null
  }

  & (Join-Path $PSScriptRoot "gen-certs.ps1")
  docker compose -f docker-compose.yml up -d --force-recreate mongo
  Write-Host "Migration complete."
}
finally {
  Pop-Location
}

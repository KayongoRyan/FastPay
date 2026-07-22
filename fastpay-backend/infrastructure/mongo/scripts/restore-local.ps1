# Restore FastPay database from a mongodump directory (requires fastpay-mongo / mongo-0 running).
param(
  [string]$BackupPath,
  [switch]$Latest,
  [switch]$Force
)

$ErrorActionPreference = "Stop"
$BackendRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
$BackupRoot = Join-Path $BackendRoot "infrastructure\mongo\backups"
$CertDir = Join-Path $BackendRoot "infrastructure\mongo\certs"

if (-not (Test-Path (Join-Path $CertDir "ca.crt"))) {
  Write-Host "Run npm run mongo:certs first."
  exit 1
}

if (Test-Path (Join-Path $BackendRoot ".env")) {
  Get-Content (Join-Path $BackendRoot ".env") | ForEach-Object {
    if ($_ -match '^\s*([^#=]+)=(.*)$') {
      [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
    }
  }
}

if ($Latest) {
  $BackupPath = Get-ChildItem $BackupRoot -Directory -Filter "dump-*" |
    Sort-Object Name -Descending |
    Select-Object -First 1 -ExpandProperty FullName
}

if (-not $BackupPath -or -not (Test-Path $BackupPath)) {
  Write-Host "Usage: npm run mongo:restore -- [-Latest] [-BackupPath path\to\dump-YYYYMMDD-HHMMSS] -Force"
  exit 1
}

$dbPath = Join-Path $BackupPath "FastPay"
if (-not (Test-Path $dbPath)) {
  Write-Host "No FastPay/ folder in backup: $BackupPath"
  exit 1
}

if (-not $Force) {
  Write-Host "This will DROP and restore the FastPay database on fastpay-mongo."
  Write-Host "Re-run with -Force to proceed: npm run mongo:restore -- -Latest -Force"
  exit 1
}

$rootUser = if ($env:MONGO_INITDB_ROOT_USERNAME) { $env:MONGO_INITDB_ROOT_USERNAME } else { "fastpay_root" }
$rootPass = $env:MONGO_INITDB_ROOT_PASSWORD
if (-not $rootPass) {
  Write-Host "Set MONGO_INITDB_ROOT_PASSWORD in .env"
  exit 1
}

$remote = "restore-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
docker cp $dbPath "fastpay-mongo:/tmp/$remote"

docker exec fastpay-mongo mongorestore `
  --host localhost --port 27017 `
  --username $rootUser `
  --password $rootPass `
  --authenticationDatabase admin `
  --db FastPay `
  --drop `
  --tls --tlsCAFile /etc/mongo/tls/ca.crt --tlsAllowInvalidHostnames `
  "/tmp/$remote"

docker exec fastpay-mongo rm -rf "/tmp/$remote"
Write-Host "Restore complete from $BackupPath"

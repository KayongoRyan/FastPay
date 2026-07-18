# Local mongodump via Docker (requires fastpay-mongo running with TLS + auth).
param(
  [string]$OutDir = "infrastructure/mongo/backups"
)

$ErrorActionPreference = "Stop"
$BackendRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
$CertDir = Join-Path $BackendRoot "infrastructure\mongo\certs"
$DumpRoot = Join-Path $BackendRoot $OutDir
New-Item -ItemType Directory -Force -Path $DumpRoot | Out-Null

if (-not (Test-Path (Join-Path $CertDir "ca.crt"))) {
  Write-Host "Run npm run mongo:certs first."
  exit 1
}

if (-not $env:MONGO_BACKUP_PASSWORD) {
  if (Test-Path (Join-Path $BackendRoot ".env")) {
    Get-Content (Join-Path $BackendRoot ".env") | ForEach-Object {
      if ($_ -match '^\s*([^#=]+)=(.*)$') {
        [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
      }
    }
  }
}

$backupUser = if ($env:MONGO_BACKUP_USER) { $env:MONGO_BACKUP_USER } else { "fastpay_backup" }
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$out = Join-Path $DumpRoot "dump-$stamp"

docker exec fastpay-mongo mongodump `
  --host localhost --port 27017 `
  --username $backupUser `
  --password $env:MONGO_BACKUP_PASSWORD `
  --authenticationDatabase FastPay `
  --db FastPay `
  --tls --tlsCAFile /etc/mongo/tls/ca.crt --tlsAllowInvalidHostnames `
  --out "/tmp/dump-$stamp"

docker cp "fastpay-mongo:/tmp/dump-$stamp" $out
Write-Host "Backup written to $out"

# Keep last 7 dumps
Get-ChildItem $DumpRoot -Directory -Filter "dump-*" |
  Sort-Object Name -Descending |
  Select-Object -Skip 7 |
  Remove-Item -Recurse -Force

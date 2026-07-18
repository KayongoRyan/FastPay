# Generate local CA + server cert for MongoDB TLS (Docker + K8s).
param(
  [switch]$Force
)

$ErrorActionPreference = "Stop"
$BackendRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
$args = @()
if ($Force) { $args += "--force" }

Push-Location $BackendRoot
try {
  node infrastructure/mongo/scripts/gen-certs.mjs @args
}
finally {
  Pop-Location
}

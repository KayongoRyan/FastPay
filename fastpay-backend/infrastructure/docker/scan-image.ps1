param(
  [string]$Image = "fastpay-backend:local",
  [string]$BaseImage = "node:22-alpine"
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SbomDir = Join-Path $ScriptDir "sbom"
New-Item -ItemType Directory -Force -Path $SbomDir | Out-Null
$SbomPath = Join-Path $SbomDir "fastpay-backend.spdx.json"

function Invoke-Trivy {
  param([string[]]$TrivyArgs)
  if (Get-Command trivy -ErrorAction SilentlyContinue) {
    & trivy @TrivyArgs
  } else {
    $dockerArgs = @("run", "--rm", "-v", "/var/run/docker.sock:/var/run/docker.sock", "aquasec/trivy:latest") + $TrivyArgs
    & docker @dockerArgs
  }
}

Write-Host "=== Scanning base image: $BaseImage ==="
Invoke-Trivy @("image", "--severity", "CRITICAL", "--exit-code", "1", $BaseImage)

Write-Host ""
Write-Host "=== Scanning runtime image: $Image ==="
Invoke-Trivy @("image", "--severity", "CRITICAL", "--exit-code", "1", $Image)

Write-Host ""
Write-Host "=== HIGH severity (informational) ==="
try { Invoke-Trivy @("image", "--severity", "HIGH", $Image) } catch { }

Write-Host ""
Write-Host "=== SBOM: $SbomPath ==="
if (Get-Command trivy -ErrorAction SilentlyContinue) {
  Invoke-Trivy @("image", "--format", "spdx-json", "-o", $SbomPath, $Image)
} else {
  docker run --rm `
    -v /var/run/docker.sock:/var/run/docker.sock `
    -v "${SbomDir}:/out" `
    aquasec/trivy:latest image --format spdx-json -o /out/fastpay-backend.spdx.json $Image
}

Write-Host ""
Write-Host "Scan passed (no CRITICAL findings)."

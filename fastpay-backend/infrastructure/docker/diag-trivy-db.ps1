# Diagnostic: Trivy DB download failure (CI scan job)
# Writes NDJSON to debug-208281.log for hypothesis evaluation.
$ErrorActionPreference = 'Continue'
$LogPath = Join-Path $PSScriptRoot '..\..\debug-208281.log'
# Resolve from script location if run from infra; prefer workspace root
if (-not (Test-Path (Split-Path $LogPath -Parent))) {
  $LogPath = Join-Path (Get-Location) 'debug-208281.log'
}
# Prefer repo root when cwd is fastpay-backend
$candidates = @(
  (Join-Path (Get-Location) 'debug-208281.log'),
  (Join-Path (Get-Location) '..\debug-208281.log'),
  (Join-Path (Get-Location) '..\..\debug-208281.log'),
  'c:\dev\Fast\debug-208281.log'
)
foreach ($c in $candidates) {
  $dir = Split-Path -Parent (Resolve-Path -LiteralPath (Split-Path $c -Parent) -ErrorAction SilentlyContinue)
  if ($null -eq $dir) { continue }
}
$LogPath = 'c:\dev\Fast\debug-208281.log'

function Write-DebugLog {
  param([string]$HypothesisId, [string]$Location, [string]$Message, [hashtable]$Data = @{})
  $payload = @{
    sessionId = '208281'
    hypothesisId = $HypothesisId
    location = $Location
    message = $Message
    data = $Data
    timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    runId = 'trivy-db-diag'
  } | ConvertTo-Json -Compress -Depth 6
  Add-Content -Path $LogPath -Value $payload -Encoding utf8
  try {
    Invoke-RestMethod -Uri 'http://127.0.0.1:7374/ingest/e5785f1a-1397-4b7d-b3c8-78db776e0924' `
      -Method POST -ContentType 'application/json' `
      -Headers @{ 'X-Debug-Session-Id' = '208281' } `
      -Body $payload -TimeoutSec 2 | Out-Null
  } catch {}
  Write-Host "[$HypothesisId] $Message :: $($Data | ConvertTo-Json -Compress)"
}

Write-DebugLog -HypothesisId 'meta' -Location 'diag-trivy-db.ps1:start' -Message 'start diagnostic' -Data @{
  docker = (docker --version 2>&1 | Out-String).Trim()
  cwd = (Get-Location).Path
}

# H-A: mirror.gcr.io unreachable or slow (CI failed mid-download at ~11%)
$sw = [System.Diagnostics.Stopwatch]::StartNew()
try {
  $r = Invoke-WebRequest -Uri 'https://mirror.gcr.io/v2/' -Method GET -TimeoutSec 20 -UseBasicParsing
  Write-DebugLog -HypothesisId 'A' -Location 'diag-trivy-db.ps1:gcr' -Message 'mirror.gcr.io reachable' -Data @{
    status = [int]$r.StatusCode
    ms = $sw.ElapsedMilliseconds
  }
} catch {
  Write-DebugLog -HypothesisId 'A' -Location 'diag-trivy-db.ps1:gcr' -Message 'mirror.gcr.io FAILED' -Data @{
    error = $_.Exception.Message
    ms = $sw.ElapsedMilliseconds
  }
}

# H-B: ghcr.io fallback is healthier than GCR mirror
$sw.Restart()
try {
  $r = Invoke-WebRequest -Uri 'https://ghcr.io/v2/' -Method GET -TimeoutSec 20 -UseBasicParsing
  Write-DebugLog -HypothesisId 'B' -Location 'diag-trivy-db.ps1:ghcr' -Message 'ghcr.io reachable' -Data @{
    status = [int]$r.StatusCode
    ms = $sw.ElapsedMilliseconds
  }
} catch {
  Write-DebugLog -HypothesisId 'B' -Location 'diag-trivy-db.ps1:ghcr' -Message 'ghcr.io FAILED' -Data @{
    error = $_.Exception.Message
    ms = $sw.ElapsedMilliseconds
  }
}

# H-C: cold DB download (~100MB) fails / times out without cache + short timeout
$cacheDir = Join-Path $env:TEMP "trivy-debug-208281-cache"
New-Item -ItemType Directory -Force -Path $cacheDir | Out-Null
$sw.Restart()
$trivyOut = ''
$exit = -1
try {
  $trivyOut = docker run --rm `
    -e TRIVY_CACHE_DIR=/cache `
    -v "${cacheDir}:/cache" `
    aquasec/trivy:0.72.0 `
    image --download-db-only --timeout 2m 2>&1 | Out-String
  $exit = $LASTEXITCODE
} catch {
  $trivyOut = $_.Exception.Message
  $exit = 99
}
Write-DebugLog -HypothesisId 'C' -Location 'diag-trivy-db.ps1:download-default' -Message 'trivy download-db-only (default repos)' -Data @{
  exitCode = $exit
  ms = $sw.ElapsedMilliseconds
  snippet = ($trivyOut.Substring(0, [Math]::Min(800, $trivyOut.Length)))
}

# H-D: explicit GHCR-first db-repository succeeds when default (GCR mirror) flakes
$cacheDir2 = Join-Path $env:TEMP "trivy-debug-208281-cache-ghcr"
New-Item -ItemType Directory -Force -Path $cacheDir2 | Out-Null
$sw.Restart()
$trivyOut2 = ''
$exit2 = -1
try {
  $trivyOut2 = docker run --rm `
    -e TRIVY_CACHE_DIR=/cache `
    -e "TRIVY_DB_REPOSITORY=ghcr.io/aquasecurity/trivy-db:2,public.ecr.aws/aquasecurity/trivy-db:2" `
    -v "${cacheDir2}:/cache" `
    aquasec/trivy:0.72.0 `
    image --download-db-only --timeout 5m 2>&1 | Out-String
  $exit2 = $LASTEXITCODE
} catch {
  $trivyOut2 = $_.Exception.Message
  $exit2 = 99
}
Write-DebugLog -HypothesisId 'D' -Location 'diag-trivy-db.ps1:download-ghcr' -Message 'trivy download-db-only (GHCR+ECR first)' -Data @{
  exitCode = $exit2
  ms = $sw.ElapsedMilliseconds
  snippet = ($trivyOut2.Substring(0, [Math]::Min(800, $trivyOut2.Length)))
}

# H-E: workflow has no timeout/db-repository/retry — confirm current YAML knobs
$wf = 'c:\dev\Fast\.github\workflows\container-security.yml'
$yml = Get-Content $wf -Raw
Write-DebugLog -HypothesisId 'E' -Location 'diag-trivy-db.ps1:workflow' -Message 'workflow trivy knobs' -Data @{
  hasTimeout = [bool]($yml -match 'timeout:')
  hasDbRepository = [bool]($yml -match 'TRIVY_DB_REPOSITORY|db-repository|trivy-db')
  hasRetry = [bool]($yml -match 'retry|nick-invision|Worten')
  hasCacheInput = [bool]($yml -match 'cache:')
  exitCodeCritical = [bool]($yml -match 'exit-code:\s*1')
}

Write-DebugLog -HypothesisId 'meta' -Location 'diag-trivy-db.ps1:end' -Message 'diagnostic complete' -Data @{
  logPath = $LogPath
}
Write-Host "Wrote $LogPath"

# Fast Trivy DB probe — NDJSON → c:\dev\Fast\debug-208281.log
$LogPath = 'c:\dev\Fast\debug-208281.log'
function W($hid, $loc, $msg, $data) {
  $p = @{ sessionId='208281'; hypothesisId=$hid; location=$loc; message=$msg; data=$data; timestamp=[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds(); runId='trivy-db-diag2' } | ConvertTo-Json -Compress -Depth 6
  Add-Content $LogPath $p -Encoding utf8
  try { Invoke-RestMethod -Uri 'http://127.0.0.1:7374/ingest/e5785f1a-1397-4b7d-b3c8-78db776e0924' -Method POST -ContentType 'application/json' -Headers @{ 'X-Debug-Session-Id'='208281' } -Body $p -TimeoutSec 2 | Out-Null } catch {}
  Write-Host "[$hid] $msg"
}

# H-E: workflow knobs (static proof)
$yml = Get-Content 'c:\dev\Fast\.github\workflows\container-security.yml' -Raw
W 'E' 'workflow.yml' 'workflow trivy knobs' @{
  hasTimeout = [bool]($yml -match '(?m)^\s+timeout:')
  hasDbRepositoryEnv = [bool]($yml -match 'TRIVY_DB_REPOSITORY')
  hasRetry = [bool]($yml -match 'retry')
  exitCodeOne = [bool]($yml -match 'exit-code:\s*1')
  pin = 'aquasecurity/trivy-action@ed142fd0'
}

# H-A/B: registry reachability — HEAD/GET that accepts 401 as UP
function Test-Registry($name, $hid, $url) {
  $sw = [Diagnostics.Stopwatch]::StartNew()
  try {
    $r = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 25 -UseBasicParsing
    W $hid "registry:$name" "$name UP" @{ status=[int]$r.StatusCode; ms=$sw.ElapsedMilliseconds; reachable=$true }
  } catch {
    $code = $null
    if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
    # 401 on /v2/ means registry is up but wants auth — reachable
    $up = ($code -eq 401 -or $code -eq 403)
    W $hid "registry:$name" $(if ($up) { "$name UP (auth challenge)" } else { "$name DOWN" }) @{
      status=$code; ms=$sw.ElapsedMilliseconds; reachable=$up; error=$_.Exception.Message
    }
  }
}
Test-Registry 'mirror.gcr.io' 'A' 'https://mirror.gcr.io/v2/'
Test-Registry 'ghcr.io' 'B' 'https://ghcr.io/v2/'
Test-Registry 'public.ecr.aws' 'B' 'https://public.ecr.aws/v2/'

# H-C: default-repo DB download (mirrors GCR-first like CI)
$cache = Join-Path $env:TEMP 'trivy-dbg-c'
New-Item -ItemType Directory -Force -Path $cache | Out-Null
$sw = [Diagnostics.Stopwatch]::StartNew()
$out = docker run --rm -e TRIVY_CACHE_DIR=/cache -v "${cache}:/cache" aquasec/trivy:0.72.0 image --download-db-only --timeout 3m 2>&1 | Out-String
$code = $LASTEXITCODE
W 'C' 'download:default' 'default DB download result' @{
  exitCode=$code; ms=$sw.ElapsedMilliseconds
  hitGcr=[bool]($out -match 'mirror\.gcr\.io')
  hitGhcr=[bool]($out -match 'ghcr\.io')
  failedDownload=[bool]($out -match 'failed to download|FATAL|timeout|context deadline')
  snippet=$out.Substring(0, [Math]::Min(1000, $out.Length))
}

# H-D: GHCR+ECR first
$cache2 = Join-Path $env:TEMP 'trivy-dbg-d'
New-Item -ItemType Directory -Force -Path $cache2 | Out-Null
$sw.Restart()
$out2 = docker run --rm `
  -e TRIVY_CACHE_DIR=/cache `
  -e 'TRIVY_DB_REPOSITORY=ghcr.io/aquasecurity/trivy-db:2,public.ecr.aws/aquasecurity/trivy-db:2,mirror.gcr.io/aquasec/trivy-db:2' `
  -v "${cache2}:/cache" `
  aquasec/trivy:0.72.0 image --download-db-only --timeout 5m 2>&1 | Out-String
$code2 = $LASTEXITCODE
W 'D' 'download:ghcr-first' 'GHCR-first DB download result' @{
  exitCode=$code2; ms=$sw.ElapsedMilliseconds
  hitGcr=[bool]($out2 -match 'mirror\.gcr\.io')
  hitGhcr=[bool]($out2 -match 'ghcr\.io')
  hitEcr=[bool]($out2 -match 'public\.ecr\.aws')
  failedDownload=[bool]($out2 -match 'failed to download|FATAL|timeout|context deadline')
  snippet=$out2.Substring(0, [Math]::Min(1000, $out2.Length))
}

W 'meta' 'end' 'done' @{ log=$LogPath }

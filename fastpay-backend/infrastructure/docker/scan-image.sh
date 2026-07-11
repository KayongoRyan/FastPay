#!/usr/bin/env bash
set -euo pipefail

IMAGE="${1:-fastpay-backend:local}"
BASE_IMAGE="${2:-node:20-alpine@sha256:b88333c42c23fbd91596ebd7fd10de239cedab9617de04142dde7315e3bc0afa}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SBOM_DIR="$SCRIPT_DIR/sbom"

trivy_cmd() {
  if command -v trivy >/dev/null 2>&1; then
    trivy "$@"
  else
    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
      aquasec/trivy:latest "$@"
  fi
}

mkdir -p "$SBOM_DIR"

echo "=== Scanning base image: $BASE_IMAGE ==="
trivy_cmd image --severity CRITICAL --exit-code 1 "$BASE_IMAGE"

echo ""
echo "=== Scanning runtime image: $IMAGE ==="
trivy_cmd image --severity CRITICAL --exit-code 1 "$IMAGE"

echo ""
echo "=== HIGH severity (informational) ==="
trivy_cmd image --severity HIGH "$IMAGE" || true

echo ""
echo "=== SBOM: $SBOM_DIR/fastpay-backend.spdx.json ==="
trivy_cmd image --format spdx-json -o "$SBOM_DIR/fastpay-backend.spdx.json" "$IMAGE"

echo ""
echo "Scan passed (no CRITICAL findings)."

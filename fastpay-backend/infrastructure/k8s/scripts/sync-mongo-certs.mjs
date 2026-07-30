#!/usr/bin/env node
/**
 * Copy Mongo TLS assets into k8s overlay dirs (kustomize secretGenerator requires
 * files to be inside or below the kustomization root).
 *
 * Usage: node infrastructure/k8s/scripts/sync-mongo-certs.mjs [local|production|all]
 */
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  unlinkSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const srcDir = resolve(root, 'infrastructure/mongo/certs');
const files = ['ca.crt', 'server.pem', 'keyfile'];

const overlays = {
  local: resolve(root, 'infrastructure/k8s/overlays/local/certs'),
  production: resolve(root, 'infrastructure/k8s/overlays/production/certs'),
};

/** Windows marks mongo keyfile read-only; copyFileSync fails with EPERM on overwrite. */
function safeCopy(src, dest) {
  if (existsSync(dest)) {
    try {
      chmodSync(dest, 0o666);
    } catch {
      // chmod is best-effort (e.g. some FS types)
    }
    unlinkSync(dest);
  }
  copyFileSync(src, dest);
}

function syncOverlay(name, destDir) {
  mkdirSync(destDir, { recursive: true });
  for (const file of files) {
    const src = resolve(srcDir, file);
    const dest = resolve(destDir, file);
    if (!existsSync(src)) {
      throw new Error(
        `Missing ${src}. Run from fastpay-backend: npm run mongo:certs`,
      );
    }
    safeCopy(src, dest);
  }
  console.log(`Synced mongo certs → overlays/${name}/certs/`);
}

const target = process.argv[2] ?? 'local';
if (target === 'all') {
  syncOverlay('local', overlays.local);
  syncOverlay('production', overlays.production);
} else if (target === 'local' || target === 'production') {
  syncOverlay(target, overlays[target]);
} else {
  console.error(`Unknown target: ${target}. Use local, production, or all.`);
  process.exit(1);
}

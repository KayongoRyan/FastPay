import { existsSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';

export function findBackendRoot(start = process.env.INIT_CWD ?? process.cwd()): string {
  let dir = start;
  for (let i = 0; i < 10; i++) {
    if (existsSync(resolve(dir, 'infrastructure/mongo/mongod.conf'))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return start;
}

/** Resolve paths relative to fastpay-backend root (works from app workspace cwd). */
export function resolveBackendPath(relativeOrAbsolute: string): string {
  if (isAbsolute(relativeOrAbsolute)) return relativeOrAbsolute;
  return resolve(findBackendRoot(), relativeOrAbsolute);
}

/** Load fastpay-backend/.env before Nest ConfigModule bootstraps (does not override existing env). */
export function loadBackendEnv(): void {
  const envPath = resolve(findBackendRoot(), '.env');
  if (!existsSync(envPath)) return;

  try {
    const raw = readFileSync(envPath, 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([^#=]+)=(.*)$/);
      if (!m) continue;
      const key = m[1].trim();
      if (!process.env[key]) process.env[key] = m[2].trim();
    }
  } catch {
    /* optional */
  }
}

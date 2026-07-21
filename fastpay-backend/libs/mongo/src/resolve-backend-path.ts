import { existsSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';

function findBackendRoot(start: string): string {
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
  const root = findBackendRoot(process.env.INIT_CWD ?? process.cwd());
  return resolve(root, relativeOrAbsolute);
}

import { spawn } from 'node:child_process';
import { connect } from 'node:net';
import { existsSync, readFileSync } from 'node:fs';
import { MongoClient } from 'mongodb';

import {
  buildMemoryMongoUri,
  MEMORY_MONGO_PORT,
  MEMORY_MONGO_STATE_FILE,
} from './memory-mongo.constants';
import { findBackendRoot, loadBackendEnv, resolveBackendPath } from './resolve-backend-path';

const DOCKER_PORT = 27018;
const DEFAULT_DB = 'FastPay';
const DEFAULT_APP_USER = 'fastpay_app';
const DEFAULT_REPLICA_SET = 'rs0';

function sleep(ms: number): Promise<void> {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function isPortOpen(port: number, host = '127.0.0.1'): Promise<boolean> {
  return new Promise((resolvePort) => {
    const socket = connect({ port, host });
    const done = (open: boolean) => {
      socket.destroy();
      resolvePort(open);
    };

    socket.setTimeout(1500);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
  });
}

function resolveCaFile(): string | undefined {
  const raw = process.env.MONGODB_TLS_CA_FILE;
  if (!raw) return undefined;
  return resolveBackendPath(raw);
}

function normalizeTlsEnv(): void {
  if (process.env.MONGODB_TLS_CA_FILE) {
    process.env.MONGODB_TLS_CA_FILE = resolveBackendPath(process.env.MONGODB_TLS_CA_FILE);
  }
}

function buildSecuredDockerUri(): string {
  const user = process.env.MONGO_APP_USER ?? DEFAULT_APP_USER;
  const password = process.env.MONGO_APP_PASSWORD;
  if (!password) {
    throw new Error(
      `MONGO_APP_PASSWORD is required to connect to secured Docker Mongo on :${DOCKER_PORT}. ` +
        'Copy .env.example to .env, set passwords, run npm run mongo:certs && npm run docker:up',
    );
  }

  const encoded = encodeURIComponent(password);
  const replicaSet = process.env.MONGO_REPLICA_SET ?? DEFAULT_REPLICA_SET;
  return (
    `mongodb://${user}:${encoded}@127.0.0.1:${DOCKER_PORT}/${DEFAULT_DB}` +
    `?authSource=${DEFAULT_DB}&replicaSet=${replicaSet}&directConnection=true`
  );
}

export function readMemoryMongoState(): { uri?: string; pid?: number; port?: number } | null {
  const statePath = resolveBackendPath(MEMORY_MONGO_STATE_FILE);
  if (!existsSync(statePath)) return null;
  try {
    return JSON.parse(readFileSync(statePath, 'utf8')) as {
      uri?: string;
      pid?: number;
      port?: number;
    };
  } catch {
    return null;
  }
}

async function pingMemoryMongoUri(uri: string): Promise<boolean> {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 3000 });
  try {
    await client.connect();
    await client.db(DEFAULT_DB).command({ ping: 1 });
    return true;
  } catch {
    return false;
  } finally {
    await client.close().catch(() => undefined);
  }
}

function applyMemoryMongoEnv(uri: string): void {
  process.env.MONGODB_URI = uri;
  process.env.MONGODB_DB_NAME ??= DEFAULT_DB;
  process.env.MONGODB_TLS = 'false';
  delete process.env.MONGODB_TLS_CA_FILE;
  delete process.env.MONGODB_TLS_ALLOW_INVALID_HOSTNAMES;
  delete process.env.MONGODB_TLS_ALLOW_INVALID;
}

function applyDockerMongoEnv(uri: string): void {
  process.env.MONGODB_URI ??= uri;
  process.env.MONGODB_DB_NAME ??= DEFAULT_DB;
  process.env.MONGODB_TLS ??= 'true';
  process.env.MONGODB_TLS_CA_FILE ??= 'infrastructure/mongo/certs/ca.crt';
  process.env.MONGODB_TLS_ALLOW_INVALID_HOSTNAMES ??= 'true';
  normalizeTlsEnv();
}

async function spawnSharedMemoryMongo(): Promise<void> {
  const script = resolveBackendPath('infrastructure/mongo/scripts/memory-mongo.mjs');
  spawn(process.execPath, [script, '--detach'], {
    cwd: findBackendRoot(),
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  }).unref();
}

async function waitForMemoryMongo(timeoutMs = 90000): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const state = readMemoryMongoState();
    if (state?.uri && (await pingMemoryMongoUri(state.uri))) {
      return state.uri;
    }
    await sleep(500);
  }
  throw new Error(
    `Shared in-memory MongoDB did not become ready within ${timeoutMs / 1000}s. ` +
      'Run manually: npm run mongo:memory',
  );
}

async function resolveSharedMemoryUri(): Promise<string | null> {
  const state = readMemoryMongoState();
  if (state?.uri && (await pingMemoryMongoUri(state.uri))) {
    return state.uri;
  }
  if (await isPortOpen(MEMORY_MONGO_PORT)) {
    const fallback = buildMemoryMongoUri();
    if (await pingMemoryMongoUri(fallback)) {
      return fallback;
    }
  }
  return null;
}

async function connectSharedMemoryMongo(
  serviceName: string,
  autoStart: boolean,
): Promise<void> {
  const existing = await resolveSharedMemoryUri();
  if (existing) {
    applyMemoryMongoEnv(existing);
    console.warn(
      `[${serviceName}] Using shared in-memory MongoDB (no auth/TLS; ephemeral).`,
    );
    return;
  }

  if (!autoStart) {
    throw new Error(
      'Shared in-memory MongoDB is not running. Start it with: npm run mongo:memory',
    );
  }

  console.warn(
    `[${serviceName}] Starting shared in-memory MongoDB replica set for local dev…`,
  );
  await spawnSharedMemoryMongo();
  const uri = await waitForMemoryMongo();
  applyMemoryMongoEnv(uri);
  console.warn(
    `[${serviceName}] Shared in-memory Mongo ready — all services use the same database.`,
  );
}

/**
 * Resolve MongoDB connection for local dev:
 * 1. Explicit MONGODB_URI (non-local ports) — unchanged
 * 2. Docker secured Mongo on :27018 (SCRAM + TLS) — unless FASTPAY_MEMORY_MONGO=true
 * 3. Shared in-memory replica set — all services share one DB; supports transactions
 */
export async function ensureMongoUri(serviceName = 'fastpay'): Promise<void> {
  loadBackendEnv();
  normalizeTlsEnv();

  const configuredUri = process.env.MONGODB_URI;
  const preferMemory = process.env.FASTPAY_MEMORY_MONGO === 'true';
  const memoryOnly = process.env.FASTPAY_MEMORY_MONGO === 'only';
  const requireDocker = process.env.FASTPAY_USE_DOCKER_MONGO === 'true';
  const autoStartMemory = process.env.FASTPAY_MEMORY_MONGO_AUTO_START !== 'false';

  if (
    configuredUri &&
    !configuredUri.includes(`:${DOCKER_PORT}`) &&
    !preferMemory &&
    !memoryOnly
  ) {
    return;
  }

  if (memoryOnly || preferMemory) {
    await connectSharedMemoryMongo(serviceName, autoStartMemory);
    return;
  }

  const dockerMongoUp = await isPortOpen(DOCKER_PORT);
  if (dockerMongoUp) {
    applyDockerMongoEnv(buildSecuredDockerUri());
    return;
  }

  if (requireDocker) {
    throw new Error(
      `MongoDB is not running on 127.0.0.1:${DOCKER_PORT}. Start Docker Desktop, then run: npm run mongo:certs && npm run docker:up`,
    );
  }

  await connectSharedMemoryMongo(serviceName, autoStartMemory);
}

/** Resolved TLS CA path for diagnostics / tooling. */
export function getMongoTlsCaFile(): string | undefined {
  return resolveCaFile();
}

export {
  buildMemoryMongoUri,
  MEMORY_MONGO_PORT,
  MEMORY_MONGO_STATE_FILE,
} from './memory-mongo.constants';

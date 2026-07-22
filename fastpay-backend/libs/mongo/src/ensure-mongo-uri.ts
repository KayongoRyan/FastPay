import { connect } from 'node:net';

import { loadBackendEnv, resolveBackendPath } from './resolve-backend-path';

const DEFAULT_PORT = 27018;
const DEFAULT_DB = 'FastPay';
const DEFAULT_APP_USER = 'fastpay_app';
const DEFAULT_REPLICA_SET = 'rs0';

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
      `MONGO_APP_PASSWORD is required to connect to secured Docker Mongo on :${DEFAULT_PORT}. ` +
        'Copy .env.example to .env, set passwords, run npm run mongo:certs && npm run docker:up',
    );
  }

  const encoded = encodeURIComponent(password);
  const replicaSet = process.env.MONGO_REPLICA_SET ?? DEFAULT_REPLICA_SET;
  return (
    `mongodb://${user}:${encoded}@127.0.0.1:${DEFAULT_PORT}/${DEFAULT_DB}` +
    `?authSource=${DEFAULT_DB}&replicaSet=${replicaSet}&directConnection=true`
  );
}

declare global {
  // eslint-disable-next-line no-var
  var __FASTPAY_MONGO_MEMORY__: { getUri(): string; stop(): Promise<boolean> } | undefined;
}

/** Use Docker Mongo when available; otherwise start in-memory Mongo for local dev. */
export async function ensureMongoUri(serviceName = 'fastpay'): Promise<void> {
  loadBackendEnv();
  normalizeTlsEnv();

  const configuredUri = process.env.MONGODB_URI;
  const forceMemory = process.env.FASTPAY_MEMORY_MONGO === 'true';
  const requireDocker = process.env.FASTPAY_USE_DOCKER_MONGO === 'true';

  if (!forceMemory && configuredUri && !configuredUri.includes(`:${DEFAULT_PORT}`)) {
    return;
  }

  const dockerMongoUp = await isPortOpen(DEFAULT_PORT);
  if (dockerMongoUp && !forceMemory) {
    process.env.MONGODB_URI ??= buildSecuredDockerUri();
    process.env.MONGODB_DB_NAME ??= DEFAULT_DB;
    process.env.MONGODB_TLS ??= 'true';
    process.env.MONGODB_TLS_CA_FILE ??= 'infrastructure/mongo/certs/ca.crt';
    process.env.MONGODB_TLS_ALLOW_INVALID_HOSTNAMES ??= 'true';
    normalizeTlsEnv();
    return;
  }

  if (requireDocker) {
    throw new Error(
      `MongoDB is not running on 127.0.0.1:${DEFAULT_PORT}. Start Docker Desktop, then run: npm run mongo:certs && npm run docker:up`,
    );
  }

  if (global.__FASTPAY_MONGO_MEMORY__) {
    process.env.MONGODB_URI = global.__FASTPAY_MONGO_MEMORY__.getUri();
    process.env.MONGODB_DB_NAME ??= DEFAULT_DB;
    return;
  }

  console.warn(
    `[${serviceName}] MongoDB not reachable on :${DEFAULT_PORT}. Starting in-memory MongoDB for local dev.`,
  );
  console.warn(
    `[${serviceName}] For persistent secured data: npm run mongo:certs && npm run docker:up`,
  );

  const { MongoMemoryServer } = await import('mongodb-memory-server');
  const server = await MongoMemoryServer.create({
    instance: {
      dbName: DEFAULT_DB,
      launchTimeout: 60000,
    },
  });

  global.__FASTPAY_MONGO_MEMORY__ = server;
  process.env.MONGODB_URI = server.getUri();
  process.env.MONGODB_DB_NAME = DEFAULT_DB;
}

/** Resolved TLS CA path for diagnostics / tooling. */
export function getMongoTlsCaFile(): string | undefined {
  return resolveCaFile();
}

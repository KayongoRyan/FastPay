import { connect } from 'node:net';

import { MongoMemoryServer } from 'mongodb-memory-server';

const DEFAULT_PORT = 27018;
const DEFAULT_DB = 'FastPay';

function isPortOpen(port: number, host = '127.0.0.1'): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = connect({ port, host });
    const done = (open: boolean) => {
      socket.destroy();
      resolve(open);
    };

    socket.setTimeout(1500);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
  });
}

declare global {
  // eslint-disable-next-line no-var
  var __FASTPAY_MONGO_MEMORY__: MongoMemoryServer | undefined;
}

/** Use Docker Mongo when available; otherwise start an in-memory server for local dev. */
export async function ensureMongoUri(): Promise<void> {
  const configuredUri = process.env.MONGODB_URI;
  const forceMemory = process.env.FASTPAY_MEMORY_MONGO === 'true';
  const requireDocker = process.env.FASTPAY_USE_DOCKER_MONGO === 'true';

  if (!forceMemory && configuredUri && !configuredUri.includes(`:${DEFAULT_PORT}`)) {
    return;
  }

  const dockerMongoUp = await isPortOpen(DEFAULT_PORT);
  if (dockerMongoUp && !forceMemory) {
    process.env.MONGODB_URI ??= `mongodb://127.0.0.1:${DEFAULT_PORT}/${DEFAULT_DB}`;
    process.env.MONGODB_DB_NAME ??= DEFAULT_DB;
    return;
  }

  if (requireDocker) {
    throw new Error(
      `MongoDB is not running on 127.0.0.1:${DEFAULT_PORT}. Start Docker Desktop, then run: npm run docker:up`,
    );
  }

  if (global.__FASTPAY_MONGO_MEMORY__) {
    process.env.MONGODB_URI = global.__FASTPAY_MONGO_MEMORY__.getUri();
    process.env.MONGODB_DB_NAME ??= DEFAULT_DB;
    return;
  }

  console.warn(
    `[auth-service] MongoDB not reachable on :${DEFAULT_PORT}. Starting in-memory MongoDB for local dev.`,
  );
  console.warn('[auth-service] For persistent data, start Docker Desktop and run: npm run docker:up');

  const server = await MongoMemoryServer.create({
    instance: {
      dbName: DEFAULT_DB,
      port: DEFAULT_PORT,
    },
  });

  global.__FASTPAY_MONGO_MEMORY__ = server;
  process.env.MONGODB_URI = server.getUri();
  process.env.MONGODB_DB_NAME = DEFAULT_DB;
}

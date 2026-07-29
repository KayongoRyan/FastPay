#!/usr/bin/env node
/**
 * Launcher for shared dev Mongo on :27019 (all services, rs0, no auth).
 * 1. Reuse running instance (state file or ping)
 * 2. Try mongodb-memory-server (fast, no Docker)
 * 3. Fall back to Docker profile (reliable on Windows)
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, unlinkSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient } from 'mongodb';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const DB = 'FastPay';
const REPLICA_SET = 'rs0';
const PORT = 27019;
const DEFAULT_URI = `mongodb://127.0.0.1:${PORT}/${DB}?replicaSet=${REPLICA_SET}&directConnection=true`;
const STATE_DIR = resolve(root, '.fastpay');
const STATE_FILE = resolve(STATE_DIR, 'memory-mongo.json');
const detach = process.argv.includes('--detach');
const forceDocker = process.argv.includes('--docker');

function readState() {
  if (!existsSync(STATE_FILE)) return null;
  try {
    return JSON.parse(readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return null;
  }
}

function writeState(extra = {}) {
  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(
    STATE_FILE,
    JSON.stringify(
      {
        uri: DEFAULT_URI,
        port: PORT,
        db: DB,
        replicaSet: REPLICA_SET,
        pid: process.pid,
        backend: extra.backend ?? 'unknown',
        startedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
    'utf8',
  );
}

function clearState() {
  try {
    if (existsSync(STATE_FILE)) unlinkSync(STATE_FILE);
  } catch {
    /* ignore */
  }
}

async function ping(uri = DEFAULT_URI) {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    await client.db(DB).command({ ping: 1 });
    return true;
  } catch {
    return false;
  } finally {
    await client.close().catch(() => undefined);
  }
}

async function verify(uri = DEFAULT_URI) {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });
  await client.connect();
  await client.db(DB).command({ ping: 1 });
  const rs = await client.db('admin').command({ replSetGetStatus: 1 });
  await client.close();
  const primary = rs.members?.find((m) => m.stateStr === 'PRIMARY');
  if (!primary) throw new Error('Replica set has no PRIMARY');
  return primary.name;
}

function startDockerMemory() {
  console.log('Starting Docker shared memory Mongo on 127.0.0.1:27019…');
  const composeFile = resolve(root, 'infrastructure/docker/docker-compose.memory.yml');
  const envFile = resolve(root, '.env');
  const args = ['compose', '-f', composeFile];
  if (existsSync(envFile)) args.push('--env-file', envFile);
  args.push('up', '-d');

  const result = spawnSync('docker', args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) {
    throw new Error('docker compose memory profile failed — is Docker Desktop running?');
  }
}

async function waitForReady(timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await ping()) return;
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error('Shared memory Mongo did not become ready in time');
}

async function tryNativeMemory() {
  const { MongoMemoryReplSet } = await import('mongodb-memory-server');
  console.log('Starting mongodb-memory-server replica set…');

  const replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, name: REPLICA_SET },
    instanceOpts: [{ dbName: DB, launchTimeout: 120000 }],
  });

  let uri = replSet.getUri();
  if (!uri.includes(`/${DB}`)) {
    uri = uri.replace(/\/?(\?|$)/, `/${DB}$1`);
  }
  if (!uri.includes('replicaSet=')) {
    uri += `${uri.includes('?') ? '&' : '?'}replicaSet=${REPLICA_SET}`;
  }

  writeState({ backend: 'mongodb-memory-server', nativeUri: uri });

  const shutdown = async () => {
    console.log('\nStopping native in-memory Mongo…');
    clearState();
    await replSet.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  const primary = await verify(uri);
  console.log(`OK: native in-memory Mongo (primary=${primary})`);
  console.log(`URI: ${uri}`);
  await new Promise(() => {});
}

async function main() {
  if (await ping()) {
    const state = readState();
    if (!state) writeState({ backend: 'docker' });
    console.log('Shared memory Mongo already running');
    console.log(state?.uri ?? DEFAULT_URI);
    if (detach) process.exit(0);
    console.log('Press Ctrl+C to stop (Docker: npm run docker:memory:down)');
    await new Promise(() => {});
    return;
  }

  if (forceDocker) {
    startDockerMemory();
    await waitForReady();
    writeState({ backend: 'docker' });
    const primary = await verify();
    console.log(`OK: Docker memory Mongo (primary=${primary})`);
    console.log(`URI: ${DEFAULT_URI}`);
    if (detach) process.exit(0);
    console.log('Press Ctrl+C to stop, then: npm run docker:memory:down');
    await new Promise(() => {});
    return;
  }

  try {
    await tryNativeMemory();
  } catch (nativeErr) {
    console.warn(
      `Native mongodb-memory-server unavailable (${nativeErr instanceof Error ? nativeErr.message : nativeErr})`,
    );
    console.warn('Falling back to Docker memory profile…');
    startDockerMemory();
    await waitForReady();
    writeState({ backend: 'docker' });
    const primary = await verify();
    console.log(`OK: Docker memory Mongo (primary=${primary})`);
    console.log(`URI: ${DEFAULT_URI}`);
    if (detach) process.exit(0);
    console.log('Press Ctrl+C to stop, then: npm run docker:memory:down');
    await new Promise(() => {});
  }
}

main().catch((err) => {
  console.error(err);
  clearState();
  process.exit(1);
});

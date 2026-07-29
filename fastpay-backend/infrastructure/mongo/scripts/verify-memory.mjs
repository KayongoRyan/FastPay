#!/usr/bin/env node
/**
 * Verify shared in-memory Mongo (TLS-free replica set).
 * Usage: node infrastructure/mongo/scripts/verify-memory.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient } from 'mongodb';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const STATE_FILE = resolve(root, '.fastpay/memory-mongo.json');
const DB = 'FastPay';

const DEFAULT_URI = `mongodb://127.0.0.1:27019/${DB}?replicaSet=rs0&directConnection=true`;

async function ping(uri) {
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

async function loadUri() {
  if (existsSync(STATE_FILE)) {
    try {
      const state = JSON.parse(readFileSync(STATE_FILE, 'utf8'));
      if (state.uri && (await ping(state.uri))) return state.uri;
    } catch {
      /* fall through */
    }
  }
  if (await ping(DEFAULT_URI)) return DEFAULT_URI;
  throw new Error('Shared memory Mongo not reachable on :27019 — run npm run mongo:memory');
}

async function main() {
  const uri = await loadUri();
  console.log('--- In-memory Mongo verification ---');

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });
  await client.connect();
  await client.db(DB).command({ ping: 1 });

  const rs = await client.db('admin').command({ replSetGetStatus: 1 });
  const primary = rs.members?.find((m) => m.stateStr === 'PRIMARY')?.name ?? 'unknown';
  const users = await client.db(DB).collection('users').countDocuments();

  console.log(`OK: ping on ${DB}`);
  console.log(`OK: replica set rs0 (primary=${primary})`);
  console.log(`OK: FastPay.users count = ${users}`);
  console.log(`URI: ${uri}`);
  await client.close();
}

main().catch((err) => {
  console.error('FAIL:', err.message);
  console.error('Start shared memory Mongo: npm run mongo:memory');
  process.exit(1);
});

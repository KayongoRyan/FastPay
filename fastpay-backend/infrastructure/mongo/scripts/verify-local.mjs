#!/usr/bin/env node
/**
 * Verify secured local Mongo (TLS + SCRAM) and optional auth/gateway smoke tests.
 * Usage: node infrastructure/mongo/scripts/verify-local.mjs [--smoke]
 */
import { MongoClient } from 'mongodb';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../../..');
const caFile = resolve(root, 'infrastructure/mongo/certs/ca.crt');
const appUser = process.env.MONGO_APP_USER ?? 'fastpay_app';
const appPassword = process.env.MONGO_APP_PASSWORD ?? 'change-me-app-dev';
const smoke = process.argv.includes('--smoke');

function loadEnv() {
  try {
    const raw = readFileSync(resolve(root, '.env'), 'utf8');
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

loadEnv();

async function verifyMongo() {
  console.log('--- Mongo verification ---');
  try {
    const open = new MongoClient('mongodb://127.0.0.1:27018/FastPay', {
      serverSelectionTimeoutMS: 3000,
    });
    await open.connect();
    await open.close();
    console.log('FAIL: unauthenticated connection succeeded (expected rejection)');
    process.exitCode = 1;
    return;
  } catch {
    console.log('OK: unauthenticated connection rejected');
  }

  const uri = `mongodb://${appUser}:${encodeURIComponent(process.env.MONGO_APP_PASSWORD ?? appPassword)}@127.0.0.1:27018/FastPay?authSource=FastPay`;
  const client = new MongoClient(uri, {
    tls: true,
    tlsCAFile: caFile,
    tlsAllowInvalidHostnames: true,
    serverSelectionTimeoutMS: 8000,
  });
  await client.connect();
  await client.db('FastPay').command({ ping: 1 });
  const users = await client.db('FastPay').collection('users').countDocuments();
  console.log('OK: TLS + SCRAM ping');
  console.log(`OK: FastPay.users count = ${users}`);
  await client.close();
}

async function smokeAuthGateway() {
  console.log('\n--- Auth / gateway smoke ---');
  const email = `smoke-${Date.now()}@fastpay.test`;
  const password = 'SmokeTest1!';

  for (const url of ['http://127.0.0.1:3001/health', 'http://127.0.0.1:3000/health']) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url} -> ${res.status}`);
    console.log(`OK: ${url}`);
  }

  const register = await fetch('http://127.0.0.1:3000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName: 'Smoke Test', email, password }),
  });
  const regBody = await register.json().catch(() => ({}));
  if (!register.ok) throw new Error(`register -> ${register.status} ${JSON.stringify(regBody)}`);
  console.log('OK: POST /auth/register via gateway');

  const login = await fetch('http://127.0.0.1:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: email, password }),
  });
  const loginBody = await login.json().catch(() => ({}));
  if (!login.ok) throw new Error(`login -> ${login.status} ${JSON.stringify(loginBody)}`);
  if (!loginBody.tokens?.accessToken) throw new Error('login missing accessToken');
  console.log('OK: POST /auth/login via gateway');

  const me = await fetch('http://127.0.0.1:3000/auth/me', {
    headers: { Authorization: `Bearer ${loginBody.tokens.accessToken}` },
  });
  const meBody = await me.json().catch(() => ({}));
  if (!me.ok) throw new Error(`me -> ${me.status} ${JSON.stringify(meBody)}`);
  console.log(`OK: GET /auth/me -> ${meBody.fullName ?? meBody.email ?? 'user'}`);
}

try {
  await verifyMongo();
  if (smoke) await smokeAuthGateway();
  console.log('\nAll checks passed.');
} catch (err) {
  console.error('FAIL:', err instanceof Error ? err.message : err);
  process.exit(1);
}

#!/usr/bin/env node
/**
 * Golden path smoke test — register → wallet → transfer → history.
 * Requires: Mongo (docker:up), gateway :3000, auth :3001, wallet :3002,
 * payment :3003 (FASTPAY_INLINE_OFFLINE_QUEUE=true), blockchain :3009.
 *
 * Usage: node infrastructure/scripts/golden-smoke.mjs [--skip-mongo]
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const gateway = process.env.GATEWAY_URL ?? 'http://127.0.0.1:3000';
const skipMongo = process.argv.includes('--skip-mongo');
const internalSecret =
  process.env.INTERNAL_SERVICE_SECRET ?? 'dev-internal-secret-change-in-production';

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

async function waitFor(url, label, attempts = 30) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        console.log(`OK: ${label}`);
        return;
      }
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`${label} not ready at ${url}`);
}

async function pollRelay(txHash, token, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`${gateway}/offline/relay/${txHash}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    if (body.status === 'confirmed') {
      console.log(`OK: relay confirmed (${txHash.slice(0, 12)}…)`);
      return body;
    }
    if (body.status === 'failed') {
      throw new Error(`Relay failed: ${body.lastError ?? 'unknown'}`);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error('Relay confirmation timed out');
}

async function main() {
  if (!skipMongo) {
    const { spawnSync } = await import('node:child_process');
    const verify = spawnSync(
      process.execPath,
      ['infrastructure/mongo/scripts/verify-local.mjs'],
      { cwd: root, stdio: 'inherit' },
    );
    if (verify.status !== 0) {
      throw new Error('Mongo verification failed');
    }
  }

  await waitFor(`${gateway}/health`, 'gateway');
  await waitFor('http://127.0.0.1:3002/health', 'wallet-service');
  await waitFor('http://127.0.0.1:3003/health', 'payment-service');
  await waitFor('http://127.0.0.1:3009/health', 'blockchain-service');

  const email = `golden-${Date.now()}@fastpay.test`;
  const password = 'GoldenTest1!';

  const register = await fetch(`${gateway}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName: 'Golden Path', email, password }),
  });
  const regBody = await register.json();
  if (!register.ok) throw new Error(`register failed: ${JSON.stringify(regBody)}`);
  console.log('OK: register');

  const token = regBody.tokens?.accessToken;
  if (!token) throw new Error('register missing accessToken');

  await new Promise((r) => setTimeout(r, 1500));

  const walletRes = await fetch(`${gateway}/wallet/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const wallet = await walletRes.json();
  if (!walletRes.ok) throw new Error(`wallet/me failed: ${JSON.stringify(wallet)}`);
  console.log(`OK: wallet/me balance=${wallet.balance} account=${wallet.accountNumber}`);

  const destRes = await fetch(`${gateway}/stellar/accounts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fundWithFriendbot: true }),
  });
  const dest = await destRes.json();
  if (!destRes.ok) throw new Error(`create dest account failed: ${JSON.stringify(dest)}`);
  console.log('OK: destination account created');

  const transferAmount = Math.min(5000, Math.max(1000, Math.floor(wallet.balance * 0.01)));
  const transfer = await fetch(`${gateway}/wallet/me/transfer`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      destination: dest.publicKey,
      amountRwf: transferAmount,
      memo: 'golden-smoke',
    }),
  });
  const transferBody = await transfer.json();
  if (!transfer.ok) throw new Error(`transfer failed: ${JSON.stringify(transferBody)}`);
  console.log(`OK: transfer queued txHash=${transferBody.txHash?.slice(0, 12)}…`);

  await pollRelay(transferBody.txHash, token);

  const historyRes = await fetch(`${gateway}/wallet/me/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const history = await historyRes.json();
  if (!historyRes.ok) throw new Error(`history failed: ${JSON.stringify(history)}`);
  if (!Array.isArray(history) || history.length === 0) {
    throw new Error('history empty after transfer');
  }
  console.log(`OK: history has ${history.length} item(s)`);

  console.log('\nGolden path smoke passed.');
}

main().catch((err) => {
  console.error('FAIL:', err instanceof Error ? err.message : err);
  process.exit(1);
});

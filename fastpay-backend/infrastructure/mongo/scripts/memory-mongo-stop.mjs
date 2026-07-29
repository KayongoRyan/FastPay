#!/usr/bin/env node
/** Stop shared memory Mongo (native pid or Docker profile). */
import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const STATE_FILE = resolve(root, '.fastpay/memory-mongo.json');
const composeFile = resolve(root, 'infrastructure/docker/docker-compose.memory.yml');

function readState() {
  if (!existsSync(STATE_FILE)) return null;
  try {
    return JSON.parse(readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return null;
  }
}

function clearState() {
  try {
    if (existsSync(STATE_FILE)) unlinkSync(STATE_FILE);
  } catch {
    /* ignore */
  }
}

const state = readState();

if (state?.backend === 'docker') {
  console.log('Stopping Docker memory Mongo…');
  spawnSync('docker', ['compose', '-f', composeFile, 'down'], {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  clearState();
  process.exit(0);
}

if (state?.pid) {
  try {
    process.kill(state.pid, 'SIGTERM');
    console.log(`Sent SIGTERM to in-memory Mongo (pid ${state.pid})`);
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'ESRCH') {
      console.log(`Process ${state.pid} not found`);
    } else {
      console.error(err);
      process.exit(1);
    }
  }
  clearState();
  process.exit(0);
}

console.log('No memory Mongo state — trying Docker memory down anyway…');
spawnSync('docker', ['compose', '-f', composeFile, 'down'], {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
clearState();

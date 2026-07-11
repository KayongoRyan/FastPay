import { connect } from 'node:net';

const DEFAULT_REDIS_PORT = 6380;

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

/** When Docker Redis is down, run offline jobs inline (no BullMQ worker). */
export async function ensureDevRedisMode(
  serviceName: string,
  host = 'localhost',
  port = DEFAULT_REDIS_PORT,
): Promise<void> {
  const forceInline = process.env.FASTPAY_INLINE_OFFLINE_QUEUE === 'true';
  const requireDocker = process.env.FASTPAY_USE_DOCKER_REDIS === 'true';

  if (forceInline) {
    process.env.FASTPAY_INLINE_OFFLINE_QUEUE = 'true';
    return;
  }

  if (await isPortOpen(port, host === 'localhost' ? '127.0.0.1' : host)) {
    process.env.FASTPAY_INLINE_OFFLINE_QUEUE = 'false';
    return;
  }

  if (requireDocker) {
    throw new Error(
      `Redis is not running on ${host}:${port}. Start Docker Desktop, then run: npm run docker:up`,
    );
  }

  console.warn(
    `[${serviceName}] Redis not reachable on ${host}:${port}. Offline queue will run inline (no BullMQ).`,
  );
  process.env.FASTPAY_INLINE_OFFLINE_QUEUE = 'true';
}

export { DEFAULT_REDIS_PORT };

/** Shared in-memory MongoDB (mongodb-memory-server) — one replica set for all local services. */
export const MEMORY_MONGO_PORT = 27019;
export const MEMORY_MONGO_DB = 'FastPay';
export const MEMORY_MONGO_REPLICA_SET = 'rs0';
export const MEMORY_MONGO_STATE_DIR = '.fastpay';
export const MEMORY_MONGO_STATE_FILE = '.fastpay/memory-mongo.json';

export function buildMemoryMongoUri(
  port = MEMORY_MONGO_PORT,
  db = MEMORY_MONGO_DB,
  replicaSet = MEMORY_MONGO_REPLICA_SET,
): string {
  return (
    `mongodb://127.0.0.1:${port}/${db}` +
    `?replicaSet=${replicaSet}&directConnection=true`
  );
}

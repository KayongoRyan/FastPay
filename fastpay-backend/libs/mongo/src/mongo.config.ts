import { registerAs } from '@nestjs/config';

import { resolveBackendPath } from './resolve-backend-path';

function envBool(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
}

export default registerAs('mongo', () => {
  const uri = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27018/FastPay';
  const tlsFromUri = uri.includes('tls=true');
  const caRaw = process.env.MONGODB_TLS_CA_FILE;
  const tlsCAFile = caRaw ? resolveBackendPath(caRaw) : undefined;

  return {
    uri,
    dbName: process.env.MONGODB_DB_NAME ?? 'FastPay',
    tls: envBool(process.env.MONGODB_TLS, tlsFromUri),
    tlsCAFile,
    tlsAllowInvalidCertificates: envBool(process.env.MONGODB_TLS_ALLOW_INVALID),
    tlsAllowInvalidHostnames: envBool(process.env.MONGODB_TLS_ALLOW_INVALID_HOSTNAMES),
  };
});

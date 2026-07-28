import { createHash } from 'crypto';

export function formatAccountNumber(publicKey: string): string {
  const hash = createHash('sha256').update(publicKey).digest('hex').toUpperCase();
  return `FP-${hash.slice(0, 4)}-${hash.slice(4, 8)}-${hash.slice(8, 12)}`;
}

export function encodeSecret(secretKey: string): string {
  return Buffer.from(secretKey, 'utf8').toString('base64');
}

export function decodeSecret(encoded: string): string {
  return Buffer.from(encoded, 'base64').toString('utf8');
}

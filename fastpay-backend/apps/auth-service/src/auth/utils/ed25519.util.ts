import { createPublicKey, verify } from 'crypto';

const ED25519_SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');

export function verifyEd25519Signature(
  publicKeyBase64: string,
  message: string,
  signatureBase64: string,
): boolean {
  try {
    const publicKeyRaw = Buffer.from(publicKeyBase64, 'base64');
    if (publicKeyRaw.length !== 32) {
      return false;
    }

    const signature = Buffer.from(signatureBase64, 'base64');
    if (signature.length !== 64) {
      return false;
    }

    const keyObject = createPublicKey({
      key: Buffer.concat([ED25519_SPKI_PREFIX, publicKeyRaw]),
      format: 'der',
      type: 'spki',
    });

    return verify(null, Buffer.from(message, 'utf8'), keyObject, signature);
  } catch {
    return false;
  }
}

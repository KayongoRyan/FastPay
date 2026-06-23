import { Keypair } from '@/lib/stellar/sdk';
import * as Crypto from 'expo-crypto';

const DEVICE_ID_KEY = 'fastpay_biometric_device_id';
const DEVICE_SECRET_KEY = 'fastpay_biometric_device_secret';

export interface DeviceKeyMaterial {
  deviceId: string;
  publicKey: string;
  secretKey: string;
}

export async function generateDeviceKeyMaterial(): Promise<DeviceKeyMaterial> {
  const keypair = Keypair.random();
  const deviceId = Crypto.randomUUID();

  return {
    deviceId,
    publicKey: Buffer.from(keypair.rawPublicKey()).toString('base64'),
    secretKey: Buffer.from(keypair.rawSecretKey()).toString('base64'),
  };
}

export function signChallenge(secretKeyBase64: string, challenge: string): string {
  const keypair = Keypair.fromRawEd25519Seed(
    Buffer.from(secretKeyBase64, 'base64').subarray(0, 32),
  );
  const signature = keypair.sign(Buffer.from(challenge, 'utf8'));
  return signature.toString('base64');
}

export { DEVICE_ID_KEY, DEVICE_SECRET_KEY };

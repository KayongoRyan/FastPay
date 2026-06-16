export interface OfflineQrPayload {
  v: 1;
  signedTxXDR: string;
  recipientPhone?: string;
  txHash?: string;
}

export function encodeOfflineQrPayload(payload: OfflineQrPayload): string {
  return JSON.stringify(payload);
}

export function decodeOfflineQrPayload(raw: string): OfflineQrPayload {
  const parsed = JSON.parse(raw) as OfflineQrPayload;

  if (parsed.v !== 1 || typeof parsed.signedTxXDR !== 'string') {
    throw new Error('Invalid offline QR payload');
  }

  return parsed;
}

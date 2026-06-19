export type MpcProviderType = 'single-key' | 'web3auth';

export interface MpcWallet {
  publicKey: string;
  provider: MpcProviderType;
}

export interface MpcProvider {
  readonly type: MpcProviderType;
  initialize(): Promise<void>;
  getWallet(): Promise<MpcWallet | null>;
  createWallet(): Promise<MpcWallet>;
  importWallet(secretKey: string): Promise<MpcWallet>;
  signPayload(payload: Uint8Array): Promise<Uint8Array>;
  signTransaction(unsignedXdr: string, networkPassphrase: string): Promise<string>;
  clearWallet(): Promise<void>;
}

export class MpcUpgradeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MpcUpgradeError';
  }
}

import { SingleKeyProvider } from './single-key-provider';
import { loadProviderType, saveProviderType } from './storage';
import type { MpcProvider, MpcProviderType, MpcWallet } from './types';
import { MpcUpgradeError } from './types';
import { Web3AuthProvider } from './web3auth-provider';

export function createMpcProvider(type: MpcProviderType): MpcProvider {
  switch (type) {
    case 'single-key':
      return new SingleKeyProvider();
    case 'web3auth':
      return new Web3AuthProvider();
    default: {
      const exhaustive: never = type;
      throw new Error(`Unsupported MPC provider: ${exhaustive}`);
    }
  }
}

export class MpcWalletService {
  private provider: MpcProvider;

  private constructor(provider: MpcProvider) {
    this.provider = provider;
  }

  static async load(): Promise<MpcWalletService> {
    const providerType = (await loadProviderType()) ?? 'single-key';
    const service = new MpcWalletService(createMpcProvider(providerType));
    await service.provider.initialize();
    return service;
  }

  get providerType(): MpcProviderType {
    return this.provider.type;
  }

  async getWallet(): Promise<MpcWallet | null> {
    return this.provider.getWallet();
  }

  async createWallet(): Promise<MpcWallet> {
    return this.provider.createWallet();
  }

  async importWallet(secretKey: string): Promise<MpcWallet> {
    return this.provider.importWallet(secretKey);
  }

  async signPayload(payload: Uint8Array): Promise<Uint8Array> {
    return this.provider.signPayload(payload);
  }

  async signTransaction(
    unsignedXdr: string,
    networkPassphrase: string,
  ): Promise<string> {
    return this.provider.signTransaction(unsignedXdr, networkPassphrase);
  }

  async clearWallet(): Promise<void> {
    await this.provider.clearWallet();
    await saveProviderType('single-key');
    this.provider = createMpcProvider('single-key');
    await this.provider.initialize();
  }

  /**
   * Future upgrade path: reconstruct MPC shares via Web3Auth and retire local secret.
   */
  async upgradeToWeb3Auth(): Promise<MpcWalletService> {
    const wallet = await this.provider.getWallet();
    if (!wallet) {
      throw new MpcUpgradeError('Create or import a wallet before upgrading to Web3Auth.');
    }

    if (this.provider.type === 'web3auth') {
      return this;
    }

    const web3auth = createMpcProvider('web3auth');
    await web3auth.initialize();

    // Migration hook: pass existing public key into Web3Auth key resharing flow.
    await saveProviderType('web3auth');
    return new MpcWalletService(web3auth);
  }
}

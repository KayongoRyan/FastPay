import { Keypair, TransactionBuilder } from '@/lib/stellar/sdk';

import {
  clearSecretKey,
  loadSecretKey,
  saveProviderType,
  saveSecretKey,
} from './storage';
import type { MpcProvider, MpcWallet } from './types';

export class SingleKeyProvider implements MpcProvider {
  readonly type = 'single-key' as const;

  private secretKey: string | null = null;

  async initialize(): Promise<void> {
    this.secretKey = await loadSecretKey();
  }

  async getWallet(): Promise<MpcWallet | null> {
    if (!this.secretKey) {
      return null;
    }

    return {
      publicKey: Keypair.fromSecret(this.secretKey).publicKey(),
      provider: this.type,
    };
  }

  async createWallet(): Promise<MpcWallet> {
    const keypair = Keypair.random();
    await this.persistKeypair(keypair);
    return this.toWallet(keypair);
  }

  async importWallet(secretKey: string): Promise<MpcWallet> {
    const keypair = Keypair.fromSecret(secretKey);
    await this.persistKeypair(keypair);
    return this.toWallet(keypair);
  }

  async signPayload(payload: Uint8Array): Promise<Uint8Array> {
    const keypair = this.requireKeypair();
    const signature = keypair.sign(Buffer.from(payload));
    return new Uint8Array(signature);
  }

  async signTransaction(
    unsignedXdr: string,
    networkPassphrase: string,
  ): Promise<string> {
    const keypair = this.requireKeypair();
    const transaction = TransactionBuilder.fromXDR(unsignedXdr, networkPassphrase);
    transaction.sign(keypair);
    return transaction.toXDR();
  }

  async clearWallet(): Promise<void> {
    this.secretKey = null;
    await clearSecretKey();
  }

  private requireKeypair(): Keypair {
    if (!this.secretKey) {
      throw new Error('Single-key wallet is not loaded');
    }

    return Keypair.fromSecret(this.secretKey);
  }

  private async persistKeypair(keypair: Keypair): Promise<void> {
    this.secretKey = keypair.secret();
    await saveSecretKey(this.secretKey);
    await saveProviderType(this.type);
  }

  private toWallet(keypair: Keypair): MpcWallet {
    return {
      publicKey: keypair.publicKey(),
      provider: this.type,
    };
  }
}

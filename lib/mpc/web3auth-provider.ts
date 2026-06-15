/**
 * Placeholder for Web3Auth MPC integration.
 *
 * Upgrade path:
 * 1. Install @web3auth/* SDK packages
 * 2. Configure EXPO_PUBLIC_WEB3AUTH_CLIENT_ID
 * 3. Implement social login + threshold key reconstruction here
 * 4. Migrate existing single-key wallets via MpcWalletService.upgradeToWeb3Auth()
 */
import type { MpcProvider, MpcWallet } from './types';
import { MpcUpgradeError } from './types';

const WEB3AUTH_CLIENT_ID = process.env.EXPO_PUBLIC_WEB3AUTH_CLIENT_ID ?? '';

export class Web3AuthProvider implements MpcProvider {
  readonly type = 'web3auth' as const;

  async initialize(): Promise<void> {
    if (!WEB3AUTH_CLIENT_ID) {
      throw new MpcUpgradeError(
        'Web3Auth is not configured. Set EXPO_PUBLIC_WEB3AUTH_CLIENT_ID before enabling MPC.',
      );
    }

    throw new MpcUpgradeError(
      'Web3Auth MPC provider is not implemented yet. Use single-key mode for now.',
    );
  }

  async getWallet(): Promise<MpcWallet | null> {
    this.notImplemented();
  }

  async createWallet(): Promise<MpcWallet> {
    this.notImplemented();
  }

  async importWallet(_secretKey: string): Promise<MpcWallet> {
    this.notImplemented();
  }

  async signPayload(_payload: Uint8Array): Promise<Uint8Array> {
    this.notImplemented();
  }

  async signTransaction(
    _unsignedXdr: string,
    _networkPassphrase: string,
  ): Promise<string> {
    this.notImplemented();
  }

  async clearWallet(): Promise<void> {
    this.notImplemented();
  }

  private notImplemented(): never {
    throw new MpcUpgradeError(
      'Web3Auth MPC provider is not implemented yet. Call upgradeToWeb3Auth() once SDK integration lands.',
    );
  }
}

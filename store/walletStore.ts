import { create } from 'zustand';

import {
  MpcUpgradeError,
  MpcWalletService,
  type MpcProviderType,
  type MpcWallet,
} from '@/lib/mpc';
import {
  assertSendAllowed,
  type ComplianceScreenResult,
} from '@/lib/compliance';

interface WalletState {
  wallet: MpcWallet | null;
  providerType: MpcProviderType;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  mpcService: MpcWalletService | null;
  initialize: () => Promise<void>;
  createWallet: () => Promise<MpcWallet>;
  clearWallet: () => Promise<void>;
  upgradeToWeb3Auth: () => Promise<void>;
  checkSendCompliance: (params: {
    destination: string;
    amount: string;
    asset?: string;
  }) => Promise<ComplianceScreenResult[]>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallet: null,
  providerType: 'single-key',
  isReady: false,
  isLoading: false,
  error: null,
  mpcService: null,

  initialize: async () => {
    set({ isLoading: true, error: null });

    try {
      const mpcService = await MpcWalletService.load();
      const wallet = await mpcService.getWallet();

      set({
        mpcService,
        wallet,
        providerType: mpcService.providerType,
        isReady: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        isReady: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize wallet',
      });
    }
  },

  createWallet: async () => {
    const { mpcService } = get();
    if (!mpcService) {
      throw new Error('Wallet service is not initialized');
    }

    set({ isLoading: true, error: null });

    try {
      const wallet = await mpcService.createWallet();
      set({ wallet, isLoading: false });
      return wallet;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create wallet';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  clearWallet: async () => {
    const { mpcService } = get();
    if (!mpcService) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      await mpcService.clearWallet();
      set({
        wallet: null,
        providerType: 'single-key',
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to clear wallet',
      });
    }
  },

  upgradeToWeb3Auth: async () => {
    const { mpcService } = get();
    if (!mpcService) {
      throw new Error('Wallet service is not initialized');
    }

    set({ isLoading: true, error: null });

    try {
      const upgraded = await mpcService.upgradeToWeb3Auth();
      const wallet = await upgraded.getWallet();

      set({
        mpcService: upgraded,
        wallet,
        providerType: upgraded.providerType,
        isLoading: false,
      });
    } catch (error) {
      const message =
        error instanceof MpcUpgradeError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Web3Auth upgrade failed';

      set({ isLoading: false, error: message });
    }
  },

  checkSendCompliance: async ({ destination, amount, asset }) => {
    const { wallet } = get();
    if (!wallet) {
      throw new Error('Wallet is not loaded');
    }

    set({ error: null });

    try {
      return await assertSendAllowed({
        source: wallet.publicKey,
        destination,
        amount,
        asset,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Compliance check failed';
      set({ error: message });
      throw error;
    }
  },
}));

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
import {
  fetchAccountBalances,
  fetchPaymentHistory,
  type PaymentHistoryItem,
} from '@/lib/api/stellar';
import { getRelayStatus, submitOfflineRelay, type RelayResponse, type RelayStatusResponse } from '@/lib/api';
import { buildUnsignedPayment } from '@/lib/stellar/build-payment';
import { STELLAR_NETWORK_PASSPHRASE } from '@/lib/stellar/constants';
import type { StellarBalanceEntry, WalletTransaction } from '@/lib/stellar/types';
import {
  formatRwfEstimateFromXlm,
  formatXlmBalance,
  getNativeBalance,
  mapPaymentToTransaction,
} from '@/lib/stellar/format';

interface WalletState {
  wallet: MpcWallet | null;
  providerType: MpcProviderType;
  isReady: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  balances: StellarBalanceEntry[];
  nativeBalanceXlm: number;
  balanceRwfEstimate: string;
  balanceXlmFormatted: string;
  transactions: WalletTransaction[];
  mpcService: MpcWalletService | null;
  initialize: () => Promise<void>;
  createWallet: () => Promise<MpcWallet>;
  clearWallet: () => Promise<void>;
  refreshWalletData: () => Promise<void>;
  upgradeToWeb3Auth: () => Promise<void>;
  checkSendCompliance: (params: {
    destination: string;
    amount: string;
    asset?: string;
  }) => Promise<ComplianceScreenResult[]>;
  prepareOfflinePayment: (params: {
    destination: string;
    amount: string;
    memo?: string;
    recipientPhone?: string;
  }) => Promise<{ signedTxXDR: string; recipientPhone?: string }>;
  relayOfflinePayment: (params: {
    signedTxXDR: string;
    recipientPhone?: string;
  }) => Promise<RelayResponse>;
  pollRelayStatus: (
    txHash: string,
    options?: { intervalMs?: number; timeoutMs?: number },
  ) => Promise<RelayStatusResponse>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallet: null,
  providerType: 'single-key',
  isReady: false,
  isLoading: false,
  isRefreshing: false,
  error: null,
  balances: [],
  nativeBalanceXlm: 0,
  balanceRwfEstimate: '0',
  balanceXlmFormatted: '0.00',
  transactions: [],
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

      if (wallet) {
        await get().refreshWalletData();
      }
    } catch (error) {
      set({
        isReady: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize wallet',
      });
    }
  },

  refreshWalletData: async () => {
    const { wallet } = get();
    if (!wallet) {
      return;
    }

    set({ isRefreshing: true, error: null });

    try {
      const [balances, payments] = await Promise.all([
        fetchAccountBalances(wallet.publicKey),
        fetchPaymentHistory(wallet.publicKey),
      ]);

      const nativeBalanceXlm = getNativeBalance(balances);
      const transactions = payments.map(mapPaymentToTransaction);

      set({
        balances,
        nativeBalanceXlm,
        balanceXlmFormatted: formatXlmBalance(nativeBalanceXlm),
        balanceRwfEstimate: formatRwfEstimateFromXlm(nativeBalanceXlm),
        transactions,
        isRefreshing: false,
      });
    } catch (error) {
      set({
        isRefreshing: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to refresh wallet data',
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
      await get().refreshWalletData();
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
        balances: [],
        nativeBalanceXlm: 0,
        balanceRwfEstimate: '0',
        balanceXlmFormatted: '0.00',
        transactions: [],
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

  prepareOfflinePayment: async ({
    destination,
    amount,
    memo,
    recipientPhone,
  }) => {
    const { mpcService, wallet } = get();
    if (!mpcService || !wallet) {
      throw new Error('Wallet is not loaded');
    }

    set({ isLoading: true, error: null });

    try {
      await assertSendAllowed({
        source: wallet.publicKey,
        destination,
        amount,
        asset: 'XLM',
      });

      const unsignedXdr = await buildUnsignedPayment({
        sourcePublicKey: wallet.publicKey,
        destination,
        amount,
        memo,
      });

      const signedTxXDR = await mpcService.signTransaction(
        unsignedXdr,
        STELLAR_NETWORK_PASSPHRASE,
      );

      set({ isLoading: false });
      return { signedTxXDR, recipientPhone };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to prepare offline payment';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  relayOfflinePayment: async ({ signedTxXDR, recipientPhone }) => {
    set({ isLoading: true, error: null });

    try {
      const response = await submitOfflineRelay({
        signedTxXDR,
        recipientPhone,
      });
      set({ isLoading: false });
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to relay offline payment';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  pollRelayStatus: async (txHash, options) => {
    const intervalMs = options?.intervalMs ?? 2000;
    const timeoutMs = options?.timeoutMs ?? 60_000;
    const started = Date.now();

    while (Date.now() - started < timeoutMs) {
      const status = await getRelayStatus(txHash);

      if (status.status === 'confirmed' || status.status === 'failed') {
        if (status.status === 'confirmed') {
          await get().refreshWalletData();
        }
        return status;
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error('Relay status timed out. Check again later.');
  },
}));

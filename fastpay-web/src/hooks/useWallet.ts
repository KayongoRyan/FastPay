import { useCallback, useEffect, useState } from "react";

import {
  fetchWallet,
  fetchWalletHistory,
  type WalletHistoryItem,
  type WalletView,
} from "../lib/wallet-api";

type WalletState = {
  wallet: WalletView | null;
  history: WalletHistoryItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useWallet(): WalletState {
  const [wallet, setWallet] = useState<WalletView | null>(null);
  const [history, setHistory] = useState<WalletHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [walletData, historyData] = await Promise.all([
        fetchWallet(),
        fetchWalletHistory(),
      ]);
      setWallet(walletData);
      setHistory(historyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load wallet");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { wallet, history, loading, error, refresh };
}

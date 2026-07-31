import { authorizedFetch, clearSession, SessionExpiredError } from "./auth-api";
import { walletAccount, recentTransactions as mockTransactions } from "./wallet-data";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const USE_MOCK = import.meta.env.VITE_USE_MOCK_WALLET === "true";

export type WalletView = {
  id: string;
  accountNumber: string;
  publicKey: string;
  balance: number;
  currency: string;
  balances: Record<string, string>;
  xlmBalance: number;
};

export type WalletHistoryItem = {
  id: string;
  txHash: string;
  status: string;
  amount: string;
  asset: string;
  direction: "in" | "out";
  counterparty: string;
  createdAt: string;
};

type ApiErrorBody = {
  message?: string | string[];
  error?: string;
};

function extractMessage(body: ApiErrorBody, fallback: string) {
  if (Array.isArray(body.message)) return body.message.join(". ");
  if (typeof body.message === "string") return body.message;
  if (body.error) return body.error;
  return fallback;
}

async function requestJson<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (options.auth) {
    const res = await authorizedFetch(path, { ...options, headers });
    const data = (await res.json().catch(() => ({}))) as ApiErrorBody & T;

    if (!res.ok) {
      if (res.status === 401) {
        clearSession();
        throw new SessionExpiredError();
      }
      throw new Error(extractMessage(data, `Request failed (${res.status})`));
    }

    return data as T;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = (await res.json().catch(() => ({}))) as ApiErrorBody & T;

  if (!res.ok) {
    throw new Error(extractMessage(data, `Request failed (${res.status})`));
  }

  return data as T;
}

export function fetchWallet() {
  if (USE_MOCK) {
    return Promise.resolve<WalletView>({
      id: "mock",
      accountNumber: walletAccount.accountNumber,
      publicKey: "GMOCK",
      balance: walletAccount.balance,
      currency: walletAccount.currency,
      balances: { XLM: String(walletAccount.balance / 1420) },
      xlmBalance: walletAccount.balance / 1420,
    });
  }
  return requestJson<WalletView>("/wallet/me", { auth: true });
}

export function fetchWalletHistory() {
  if (USE_MOCK) {
    return Promise.resolve<WalletHistoryItem[]>(
      mockTransactions.map((tx) => ({
        id: tx.id,
        txHash: tx.id,
        status: "confirmed",
        amount: String(Math.abs(tx.amount)),
        asset: "XLM",
        direction: tx.direction,
        counterparty: tx.name,
        createdAt: new Date().toISOString(),
      })),
    );
  }
  return requestJson<WalletHistoryItem[]>("/wallet/me/history", { auth: true });
}

export function transferFunds(input: {
  destination: string;
  amountRwf: number;
  memo?: string;
}) {
  if (USE_MOCK) {
    return Promise.resolve({
      txHash: `mock-${Date.now()}`,
      queueId: "mock",
      estimatedSeconds: 0,
      amountRwf: input.amountRwf,
      destination: input.destination,
    });
  }
  return requestJson<{
    txHash: string;
    queueId: string;
    estimatedSeconds: number;
    amountRwf: number;
    destination: string;
  }>("/wallet/me/transfer", {
    method: "POST",
    auth: true,
    body: JSON.stringify(input),
  });
}

export function initiateMomo(input: {
  walletPublicKey: string;
  phone: string;
  amountRwf: number;
  provider: "mtn" | "airtel";
}) {
  if (USE_MOCK) {
    return Promise.resolve({
      paymentId: `momo-mock-${Date.now()}`,
      status: "pending",
      message: "Simulated MoMo top-up started",
    });
  }
  return requestJson<{ paymentId: string; status: string; message: string }>(
    "/momo/initiate",
    {
      method: "POST",
      auth: true,
      body: JSON.stringify(input),
    },
  );
}

export function payBill(input: {
  billerId: string;
  reference: string;
  amountRwf: number;
  settlementDestination?: string;
}) {
  const destination =
    input.settlementDestination ??
    import.meta.env.VITE_BILL_SETTLEMENT ??
    "GCKFBEIYTKPBJRAQDJQHEQUXHPIKUPZOIDFFQPCCVRFHTEYSAVP7SFXM";

  return transferFunds({
    destination,
    amountRwf: input.amountRwf,
    memo: `BILL:${input.billerId}:${input.reference}`,
  });
}
export function formatRwf(amount: number): string {
  return `RWF ${amount.toLocaleString("en-US")}`;
}

export function formatHistoryLabel(item: WalletHistoryItem): string {
  return item.direction === "out" ? item.counterparty : item.counterparty;
}

export function formatHistoryDetail(item: WalletHistoryItem): string {
  return `${item.amount} ${item.asset} · ${item.status}`;
}

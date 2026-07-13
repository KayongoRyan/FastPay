export type SupportedCrypto = "USDT" | "BTC" | "SOL";

export const SUPPORTED_CRYPTOS: SupportedCrypto[] = ["USDT", "BTC", "SOL"];

export const PRIMARY_CRYPTO: SupportedCrypto = "USDT";

export const CRYPTO_LABELS: Record<SupportedCrypto, string> = {
  USDT: "Tether USD",
  BTC: "Bitcoin",
  SOL: "Solana",
};

/** Demo FX for portfolio display until live price feeds are wired. */
export const CRYPTO_TO_USDT: Record<SupportedCrypto, number> = {
  USDT: 1,
  BTC: 95_000,
  SOL: 180,
};

export interface CryptoHolding {
  symbol: SupportedCrypto;
  amount: number;
  amountFormatted: string;
  usdtValue: number;
}

export interface CryptoPortfolio {
  holdings: CryptoHolding[];
  totalUsdt: number;
  totalUsdtFormatted: string;
  totalRwfFormatted: string;
}

const USDT_TO_RWF = 1_300;

function hashSeed(seed: string): number {
  let acc = 0;
  for (let i = 0; i < seed.length; i++) {
    acc = (acc * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return acc;
}

function formatAmount(amount: number, maxDecimals: number): string {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
}

/** Derive USDT/BTC/SOL holdings from wallet seed + total USDT-equivalent balance. */
export function buildCryptoPortfolio(
  totalUsdtEquivalent: number,
  seed: string,
): CryptoPortfolio {
  if (totalUsdtEquivalent <= 0) {
    return {
      holdings: SUPPORTED_CRYPTOS.map((symbol) => ({
        symbol,
        amount: 0,
        amountFormatted: "0",
        usdtValue: 0,
      })),
      totalUsdt: 0,
      totalUsdtFormatted: "0.00",
      totalRwfFormatted: "0",
    };
  }

  const hash = hashSeed(seed || "fastpay");
  const usdtShare = 0.58 + (hash % 15) / 100;
  const btcShare = 0.22 + (hash % 8) / 100;
  const solShare = Math.max(0.08, 1 - usdtShare - btcShare);

  const usdtValue = totalUsdtEquivalent * usdtShare;
  const btcValue = totalUsdtEquivalent * btcShare;
  const solValue = totalUsdtEquivalent * solShare;

  const holdings: CryptoHolding[] = [
    {
      symbol: "USDT",
      amount: usdtValue,
      amountFormatted: formatAmount(usdtValue, 2),
      usdtValue,
    },
    {
      symbol: "BTC",
      amount: btcValue / CRYPTO_TO_USDT.BTC,
      amountFormatted: formatAmount(btcValue / CRYPTO_TO_USDT.BTC, 6),
      usdtValue: btcValue,
    },
    {
      symbol: "SOL",
      amount: solValue / CRYPTO_TO_USDT.SOL,
      amountFormatted: formatAmount(solValue / CRYPTO_TO_USDT.SOL, 4),
      usdtValue: solValue,
    },
  ];

  return {
    holdings,
    totalUsdt: totalUsdtEquivalent,
    totalUsdtFormatted: formatAmount(totalUsdtEquivalent, 2),
    totalRwfFormatted: Math.round(totalUsdtEquivalent * USDT_TO_RWF).toLocaleString(),
  };
}

export function getPrimaryHolding(portfolio: CryptoPortfolio): CryptoHolding {
  return (
    portfolio.holdings.find((h) => h.symbol === PRIMARY_CRYPTO) ??
    portfolio.holdings[0]
  );
}

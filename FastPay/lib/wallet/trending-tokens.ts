export type TrendingPeriod = "today" | "week" | "month";

export interface TrendingToken {
  id: string;
  name: string;
  symbol: string;
  date: string;
  amountRwf: number;
  changePercent: number;
  image: string;
}

export const TRENDING_PERIODS: { id: TrendingPeriod; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
];

/** Mock trending activity — replace with API feed. */
export const TRENDING_TOKENS: Record<TrendingPeriod, TrendingToken[]> = {
  today: [
    {
      id: "t1",
      name: "Bitcoin",
      symbol: "BTC",
      date: "27 05 2026",
      amountRwf: 312_400,
      changePercent: 2.1,
      image:
        "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=120&h=120&fit=crop",
    },
    {
      id: "t2",
      name: "USDT",
      symbol: "USDT",
      date: "27 05 2026",
      amountRwf: 128_200,
      changePercent: 2.4,
      image:
        "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=120&h=120&fit=crop",
    },
    {
      id: "t3",
      name: "Solana",
      symbol: "SOL",
      date: "26 05 2026",
      amountRwf: 95_600,
      changePercent: 4.2,
      image:
        "https://images.unsplash.com/photo-1622630992268-f73695f3f2a5?w=120&h=120&fit=crop",
    },
    {
      id: "t4",
      name: "Transfer",
      symbol: "RWF",
      date: "26 05 2026",
      amountRwf: 75_000,
      changePercent: -0.6,
      image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=120&h=120&fit=crop",
    },
  ],
  week: [
    {
      id: "w1",
      name: "Bitcoin",
      symbol: "BTC",
      date: "25 05 2026",
      amountRwf: 890_200,
      changePercent: 3.8,
      image:
        "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=120&h=120&fit=crop",
    },
    {
      id: "w2",
      name: "USDT",
      symbol: "USDT",
      date: "25 05 2026",
      amountRwf: 410_500,
      changePercent: 3.1,
      image:
        "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=120&h=120&fit=crop",
    },
    {
      id: "w3",
      name: "Solana",
      symbol: "SOL",
      date: "24 05 2026",
      amountRwf: 245_800,
      changePercent: 5.4,
      image:
        "https://images.unsplash.com/photo-1622630992268-f73695f3f2a5?w=120&h=120&fit=crop",
    },
  ],
  month: [
    {
      id: "m1",
      name: "Bitcoin",
      symbol: "BTC",
      date: "15 05 2026",
      amountRwf: 2_180_000,
      changePercent: 6.2,
      image:
        "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=120&h=120&fit=crop",
    },
    {
      id: "m2",
      name: "USDT",
      symbol: "USDT",
      date: "15 05 2026",
      amountRwf: 1_240_000,
      changePercent: 5.6,
      image:
        "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=120&h=120&fit=crop",
    },
    {
      id: "m3",
      name: "Solana",
      symbol: "SOL",
      date: "10 05 2026",
      amountRwf: 680_400,
      changePercent: 8.1,
      image:
        "https://images.unsplash.com/photo-1622630992268-f73695f3f2a5?w=120&h=120&fit=crop",
    },
  ],
};

export function filterTrendingTokens(
  tokens: TrendingToken[],
  query: string,
): TrendingToken[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return tokens;
  }
  return tokens.filter(
    (token) =>
      token.name.toLowerCase().includes(q) ||
      token.symbol.toLowerCase().includes(q),
  );
}

export function formatTokenAmount(amountRwf: number): string {
  return `${amountRwf.toLocaleString()} RWF`;
}

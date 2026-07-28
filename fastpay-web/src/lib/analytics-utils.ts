import type { WalletHistoryItem } from "./wallet-api";

export type AnalyticsPeriod = "weekly" | "monthly" | "yearly";

export type AnalyticsSnapshot = {
  label: string;
  spent: number;
  income: number;
  net: number;
  bars: number[];
  categories: Array<{ name: string; amount: number; pct: number; color: string }>;
};

const CATEGORY_COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#a855f7",
];

function inPeriod(date: Date, period: AnalyticsPeriod, now = new Date()) {
  const ms = now.getTime() - date.getTime();
  if (period === "weekly") return ms <= 7 * 86400000;
  if (period === "monthly") return ms <= 30 * 86400000;
  return ms <= 365 * 86400000;
}

function bucketKey(date: Date, period: AnalyticsPeriod) {
  if (period === "weekly") {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }
  if (period === "monthly") {
    return `${date.getDate()}`;
  }
  return date.toLocaleDateString("en-US", { month: "short" });
}

export function buildAnalyticsFromHistory(
  history: WalletHistoryItem[],
  period: AnalyticsPeriod,
): AnalyticsSnapshot {
  const now = new Date();
  const filtered = history.filter((item) =>
    inPeriod(new Date(item.createdAt), period, now),
  );

  let spent = 0;
  let income = 0;
  const categoryTotals = new Map<string, number>();
  const barTotals = new Map<string, number>();

  for (const item of filtered) {
    const amount = Number(item.amount) || 0;
    const rwfEstimate = amount * 1420;
    const key = bucketKey(new Date(item.createdAt), period);

    if (item.direction === "out") {
      spent += rwfEstimate;
      barTotals.set(key, (barTotals.get(key) ?? 0) + rwfEstimate);
      const cat = item.asset || "Transfer";
      categoryTotals.set(cat, (categoryTotals.get(cat) ?? 0) + rwfEstimate);
    } else {
      income += rwfEstimate;
      barTotals.set(key, (barTotals.get(key) ?? 0) + rwfEstimate);
    }
  }

  const bars = [...barTotals.values()];
  if (bars.length === 0) {
    bars.push(0);
  }

  const totalOut = spent || 1;
  const categories = [...categoryTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, amount], index) => ({
      name,
      amount,
      pct: Math.round((amount / totalOut) * 100),
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }));

  const labels: Record<AnalyticsPeriod, string> = {
    weekly: "This week",
    monthly: "This month",
    yearly: "This year",
  };

  return {
    label: labels[period],
    spent,
    income,
    net: income - spent,
    bars,
    categories,
  };
}

export function formatRwfCompact(amount: number): string {
  if (amount >= 1_000_000) {
    return `RWF ${(amount / 1_000_000).toFixed(1)}M`;
  }
  return `RWF ${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

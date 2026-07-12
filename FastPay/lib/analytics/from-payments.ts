import type { PaymentHistoryItem } from "@/lib/api/stellar";
import { formatTxDate } from "@/lib/stellar/format";

import {
  buildWeeklySummary,
  normalizeDailyChartValues,
  type WeeklyFinanceSources,
} from "./weekly";

export interface AnalyticsCategoryRow {
  id: string;
  title: string;
  date: string;
  amount: string;
  totalRwf: number;
}

/** @deprecated Use buildWeeklySummary for calendar-week analytics. */
export function aggregateAnalytics(payments: PaymentHistoryItem[]) {
  const summary = buildWeeklySummary({ payments, bills: [], momoPayments: [] });

  const categoryRows: AnalyticsCategoryRow[] = summary.expenseTransactions
    .slice(0, 8)
    .map((tx) => ({
      id: tx.id,
      title: tx.title,
      date: formatTxDate(tx.occurredAt),
      amount: `${Math.round(tx.amountRwf).toLocaleString()} RWF`,
      totalRwf: tx.amountRwf,
    }));

  return {
    expenseTotal: summary.expenseTotalRwf,
    incomeTotal: summary.incomeTotalRwf,
    categoryRows,
    dailyTotals: normalizeDailyChartValues(summary.expenseByDay),
  };
}

export { buildWeeklySummary, type WeeklyFinanceSources };

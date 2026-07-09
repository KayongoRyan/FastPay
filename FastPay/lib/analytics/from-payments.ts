import type { PaymentHistoryItem } from "@/lib/api/stellar";
import { formatTxDate } from "@/lib/stellar/format";

export interface AnalyticsCategoryRow {
  id: string;
  title: string;
  date: string;
  amount: string;
  totalRwf: number;
}

const XLM_TO_RWF = 1_500;

export function aggregateAnalytics(payments: PaymentHistoryItem[]) {
  const expenses = payments.filter((p) => p.direction === "out");
  const income = payments.filter((p) => p.direction === "in");

  const sumRwf = (items: PaymentHistoryItem[]) =>
    items.reduce((sum, item) => {
      const amount = Number(item.amount) || 0;
      const rwf =
        item.asset === "XLM" ? amount * XLM_TO_RWF : amount;
      return sum + rwf;
    }, 0);

  const expenseTotal = sumRwf(expenses);
  const incomeTotal = sumRwf(income);

  const categoryRows: AnalyticsCategoryRow[] = expenses
    .slice(0, 8)
    .map((payment) => {
      const amount = Number(payment.amount) || 0;
      const rwf = payment.asset === "XLM" ? amount * XLM_TO_RWF : amount;
      return {
        id: payment.id,
        title:
          payment.direction === "out" ? "Transfer out" : "Transfer in",
        date: formatTxDate(payment.createdAt),
        amount: `${Math.round(rwf).toLocaleString()} RWF`,
        totalRwf: rwf,
      };
    });

  const dailyTotals = buildWeeklyTotals(expenses);

  return {
    expenseTotal,
    incomeTotal,
    categoryRows,
    dailyTotals,
  };
}

function buildWeeklyTotals(expenses: PaymentHistoryItem[]): number[] {
  const totals = [0, 0, 0, 0, 0, 0, 0];
  const now = new Date();

  for (const payment of expenses) {
    const date = new Date(payment.createdAt);
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays >= 0 && diffDays < 7) {
      const dayIndex = 6 - diffDays;
      const amount = Number(payment.amount) || 0;
      const rwf = payment.asset === "XLM" ? amount * XLM_TO_RWF : amount;
      totals[dayIndex] += rwf;
    }
  }

  const max = Math.max(...totals, 1);
  return totals.map((value) => value / max);
}

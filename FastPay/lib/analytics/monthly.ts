import {
  normalizeAllSources,
  type WeeklyFinanceSources,
  type WeeklyTransaction,
} from "@/lib/analytics/weekly";

export interface MonthBounds {
  monthKey: string;
  start: Date;
  end: Date;
  dayLabels: string[];
  label: string;
  daysInMonth: number;
}

export interface MonthlySummary {
  bounds: MonthBounds;
  incomeTotalRwf: number;
  expenseTotalRwf: number;
  netRwf: number;
  incomeTransactions: WeeklyTransaction[];
  expenseTransactions: WeeklyTransaction[];
  incomeByDay: number[];
  expenseByDay: number[];
  transactionCount: { income: number; expense: number };
}

export function getMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function getMonthBounds(anchorDate: Date = new Date()): MonthBounds {
  const start = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);

  const daysInMonth = end.getDate();
  const dayLabels = Array.from({ length: daysInMonth }, (_, i) =>
    String(i + 1),
  );

  const label = start.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return {
    monthKey: getMonthKey(start),
    start,
    end,
    dayLabels,
    label,
    daysInMonth,
  };
}

export function shiftMonth(anchorDate: Date, months: number): Date {
  const next = new Date(anchorDate);
  next.setDate(1);
  next.setMonth(next.getMonth() + months);
  return next;
}

export function filterTransactionsInMonth(
  transactions: WeeklyTransaction[],
  bounds: MonthBounds,
): WeeklyTransaction[] {
  return transactions.filter((tx) => {
    const at = new Date(tx.occurredAt).getTime();
    return at >= bounds.start.getTime() && at <= bounds.end.getTime();
  });
}

export function buildMonthlyDailyTotals(
  transactions: WeeklyTransaction[],
  daysInMonth: number,
): number[] {
  const totals = Array.from({ length: daysInMonth }, () => 0);

  for (const tx of transactions) {
    const dayIndex = new Date(tx.occurredAt).getDate() - 1;
    if (dayIndex >= 0 && dayIndex < daysInMonth) {
      totals[dayIndex] += tx.amountRwf;
    }
  }

  return totals;
}

export function buildMonthlySummary(
  sources: WeeklyFinanceSources,
  anchorDate: Date = new Date(),
): MonthlySummary {
  const bounds = getMonthBounds(anchorDate);
  const all = normalizeAllSources(sources);
  const inMonth = filterTransactionsInMonth(all, bounds);

  const incomeTransactions = inMonth
    .filter((tx) => tx.direction === "income")
    .sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );

  const expenseTransactions = inMonth
    .filter((tx) => tx.direction === "expense")
    .sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );

  const incomeTotalRwf = incomeTransactions.reduce(
    (sum, tx) => sum + tx.amountRwf,
    0,
  );
  const expenseTotalRwf = expenseTransactions.reduce(
    (sum, tx) => sum + tx.amountRwf,
    0,
  );

  return {
    bounds,
    incomeTotalRwf,
    expenseTotalRwf,
    netRwf: incomeTotalRwf - expenseTotalRwf,
    incomeTransactions,
    expenseTransactions,
    incomeByDay: buildMonthlyDailyTotals(
      incomeTransactions,
      bounds.daysInMonth,
    ),
    expenseByDay: buildMonthlyDailyTotals(
      expenseTransactions,
      bounds.daysInMonth,
    ),
    transactionCount: {
      income: incomeTransactions.length,
      expense: expenseTransactions.length,
    },
  };
}

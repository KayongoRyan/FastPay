import {
  normalizeAllSources,
  type WeeklyFinanceSources,
  type WeeklyTransaction,
} from "@/lib/analytics/weekly";

export interface YearBounds {
  yearKey: string;
  start: Date;
  end: Date;
  monthLabels: string[];
  label: string;
}

export interface YearlySummary {
  bounds: YearBounds;
  incomeTotalRwf: number;
  expenseTotalRwf: number;
  netRwf: number;
  incomeTransactions: WeeklyTransaction[];
  expenseTransactions: WeeklyTransaction[];
  incomeByMonth: number[];
  expenseByMonth: number[];
  transactionCount: { income: number; expense: number };
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function getYearKey(date: Date): string {
  return String(date.getFullYear());
}

export function getYearBounds(anchorDate: Date = new Date()): YearBounds {
  const year = anchorDate.getFullYear();
  const start = new Date(year, 0, 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(year, 11, 31);
  end.setHours(23, 59, 59, 999);

  return {
    yearKey: getYearKey(start),
    start,
    end,
    monthLabels: MONTH_LABELS,
    label: String(year),
  };
}

export function shiftYear(anchorDate: Date, years: number): Date {
  const next = new Date(anchorDate);
  next.setFullYear(next.getFullYear() + years);
  return next;
}

export function filterTransactionsInYear(
  transactions: WeeklyTransaction[],
  bounds: YearBounds,
): WeeklyTransaction[] {
  return transactions.filter((tx) => {
    const at = new Date(tx.occurredAt).getTime();
    return at >= bounds.start.getTime() && at <= bounds.end.getTime();
  });
}

export function buildYearlyMonthlyTotals(
  transactions: WeeklyTransaction[],
): number[] {
  const totals = Array.from({ length: 12 }, () => 0);

  for (const tx of transactions) {
    const monthIndex = new Date(tx.occurredAt).getMonth();
    totals[monthIndex] += tx.amountRwf;
  }

  return totals;
}

export function buildYearlySummary(
  sources: WeeklyFinanceSources,
  anchorDate: Date = new Date(),
): YearlySummary {
  const bounds = getYearBounds(anchorDate);
  const all = normalizeAllSources(sources);
  const inYear = filterTransactionsInYear(all, bounds);

  const incomeTransactions = inYear
    .filter((tx) => tx.direction === "income")
    .sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );

  const expenseTransactions = inYear
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
    incomeByMonth: buildYearlyMonthlyTotals(incomeTransactions),
    expenseByMonth: buildYearlyMonthlyTotals(expenseTransactions),
    transactionCount: {
      income: incomeTransactions.length,
      expense: expenseTransactions.length,
    },
  };
}

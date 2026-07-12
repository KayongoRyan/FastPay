import type { PaymentHistoryItem } from "@/lib/api/stellar";
import type { MomoHistoryItem } from "@/lib/api/momo";
import type { BillCategoryId, BillPayment } from "@/lib/bills/types";

export type TransactionSource = "wallet" | "bill" | "momo";
export type FlowDirection = "income" | "expense";

export interface WeeklyTransaction {
  id: string;
  source: TransactionSource;
  direction: FlowDirection;
  amountRwf: number;
  title: string;
  subtitle?: string;
  occurredAt: string;
}

export interface WeekBounds {
  weekKey: string;
  start: Date;
  end: Date;
  dayLabels: string[];
  label: string;
}

export interface WeeklySummary {
  bounds: WeekBounds;
  incomeTotalRwf: number;
  expenseTotalRwf: number;
  netRwf: number;
  incomeTransactions: WeeklyTransaction[];
  expenseTransactions: WeeklyTransaction[];
  incomeByDay: number[];
  expenseByDay: number[];
  transactionCount: { income: number; expense: number };
}

export interface WeeklyFinanceSources {
  payments: PaymentHistoryItem[];
  bills: BillPayment[];
  momoPayments: MomoHistoryItem[];
}

const XLM_TO_RWF = 1_500;
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const BILL_CATEGORY_LABELS: Record<BillCategoryId, string> = {
  rent: "Rent",
  groceries: "Groceries",
  wifi: "WiFi",
  electricity: "Electricity",
  water: "Water",
};

export function getWeekKey(date: Date): string {
  const monday = getMonday(date);
  const year = monday.getFullYear();
  const week = getIsoWeekNumber(monday);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + diffToMonday);
  return d;
}

function getIsoWeekNumber(monday: Date): number {
  const thursday = new Date(monday);
  thursday.setDate(monday.getDate() + 3);
  const yearStart = new Date(thursday.getFullYear(), 0, 1);
  const diffDays = Math.floor(
    (thursday.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24),
  );
  return Math.ceil((diffDays + yearStart.getDay() + 1) / 7);
}

export function getWeekBounds(anchorDate: Date = new Date()): WeekBounds {
  const start = getMonday(anchorDate);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  const startLabel = start.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
  const endLabel = end.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

  return {
    weekKey: getWeekKey(start),
    start,
    end,
    dayLabels: DAY_LABELS,
    label: `${startLabel} – ${endLabel}`,
  };
}

export function shiftWeek(anchorDate: Date, weeks: number): Date {
  const next = new Date(anchorDate);
  next.setDate(next.getDate() + weeks * 7);
  return next;
}

function paymentAmountRwf(payment: PaymentHistoryItem): number {
  const amount = Number(payment.amount) || 0;
  return payment.asset === "XLM" ? amount * XLM_TO_RWF : amount;
}

export function normalizeWalletPayment(
  payment: PaymentHistoryItem,
): WeeklyTransaction {
  const amountRwf = paymentAmountRwf(payment);
  const direction: FlowDirection =
    payment.direction === "in" ? "income" : "expense";

  return {
    id: `wallet-${payment.id}`,
    source: "wallet",
    direction,
    amountRwf,
    title: direction === "income" ? "Transfer in" : "Transfer out",
    subtitle: payment.counterparty
      ? `${payment.counterparty.slice(0, 8)}…`
      : undefined,
    occurredAt: payment.createdAt,
  };
}

export function normalizeBillPayment(bill: BillPayment): WeeklyTransaction {
  return {
    id: `bill-${bill.id}`,
    source: "bill",
    direction: "expense",
    amountRwf: bill.amountRwf,
    title: bill.label,
    subtitle: BILL_CATEGORY_LABELS[bill.categoryId],
    occurredAt: new Date(`${bill.paidAt}T12:00:00`).toISOString(),
  };
}

export function normalizeMomoPayment(momo: MomoHistoryItem): WeeklyTransaction {
  const providerLabel = momo.provider.toUpperCase();
  return {
    id: `momo-${momo.paymentId}`,
    source: "momo",
    direction: "expense",
    amountRwf: momo.amountRwf,
    title: `MoMo top-up (${providerLabel})`,
    subtitle: momo.phone,
    occurredAt: momo.createdAt,
  };
}

export function normalizeAllSources(
  sources: WeeklyFinanceSources,
): WeeklyTransaction[] {
  return [
    ...sources.payments.map(normalizeWalletPayment),
    ...sources.bills.map(normalizeBillPayment),
    ...sources.momoPayments.map(normalizeMomoPayment),
  ];
}

export function filterTransactionsInWeek(
  transactions: WeeklyTransaction[],
  bounds: WeekBounds,
): WeeklyTransaction[] {
  return transactions.filter((tx) => {
    const at = new Date(tx.occurredAt).getTime();
    return at >= bounds.start.getTime() && at <= bounds.end.getTime();
  });
}

export function buildDailyTotals(
  transactions: WeeklyTransaction[],
  bounds: WeekBounds,
): number[] {
  const totals = [0, 0, 0, 0, 0, 0, 0];

  for (const tx of transactions) {
    const date = new Date(tx.occurredAt);
    const day = date.getDay();
    const index = day === 0 ? 6 : day - 1;
    totals[index] += tx.amountRwf;
  }

  return totals;
}

export function normalizeDailyChartValues(values: number[]): number[] {
  const max = Math.max(...values, 1);
  return values.map((value) => value / max);
}

export function buildWeeklySummary(
  sources: WeeklyFinanceSources,
  anchorDate: Date = new Date(),
): WeeklySummary {
  const bounds = getWeekBounds(anchorDate);
  const all = normalizeAllSources(sources);
  const inWeek = filterTransactionsInWeek(all, bounds);

  const incomeTransactions = inWeek
    .filter((tx) => tx.direction === "income")
    .sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );

  const expenseTransactions = inWeek
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
    incomeByDay: buildDailyTotals(incomeTransactions, bounds),
    expenseByDay: buildDailyTotals(expenseTransactions, bounds),
    transactionCount: {
      income: incomeTransactions.length,
      expense: expenseTransactions.length,
    },
  };
}

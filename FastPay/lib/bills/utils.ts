import { monthKey, monthLabel } from "@/lib/bills/format";
import type { BillCategoryId, BillMonthSummary, BillPayment } from "@/lib/bills/types";

export function groupPaymentsByMonth(payments: BillPayment[]): BillMonthSummary[] {
  const buckets = new Map<string, BillPayment[]>();

  for (const payment of payments) {
    const [yearStr, monthStr] = payment.paidAt.split("-");
    const key = monthKey(Number(yearStr), Number(monthStr));
    const list = buckets.get(key) ?? [];
    list.push(payment);
    buckets.set(key, list);
  }

  return [...buckets.entries()]
    .map(([key, monthPayments]) => {
      const [yearStr, monthStr] = key.split("-");
      const year = Number(yearStr);
      const month = Number(monthStr);
      const sorted = [...monthPayments].sort(
        (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime(),
      );

      return {
        key,
        label: monthLabel(year, month),
        year,
        month,
        totalRwf: sorted.reduce((sum, item) => sum + item.amountRwf, 0),
        payments: sorted,
      };
    })
    .sort((a, b) => b.year - a.year || b.month - a.month);
}

export function getCategoryTotals(
  payments: BillPayment[],
): Partial<Record<BillCategoryId, number>> {
  const totals: Partial<Record<BillCategoryId, number>> = {};

  for (const payment of payments) {
    totals[payment.categoryId] =
      (totals[payment.categoryId] ?? 0) + payment.amountRwf;
  }

  return totals;
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseAmountRwf(value: string): number {
  const digits = value.replace(/[^\d]/g, "");
  return Number(digits) || 0;
}

export function createBillId(): string {
  return `bill_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

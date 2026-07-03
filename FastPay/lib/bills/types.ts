import type { LucideIcon } from "lucide-react-native";

export type BillCategoryId =
  | "rent"
  | "groceries"
  | "wifi"
  | "electricity"
  | "water";

export interface BillCategory {
  id: BillCategoryId;
  label: string;
  icon: LucideIcon;
  tint: string;
}

export interface BillPayment {
  id: string;
  categoryId: BillCategoryId;
  label: string;
  amountRwf: number;
  /** ISO date string (YYYY-MM-DD) */
  paidAt: string;
}

export interface BillMonthSummary {
  key: string;
  label: string;
  year: number;
  month: number;
  totalRwf: number;
  payments: BillPayment[];
}

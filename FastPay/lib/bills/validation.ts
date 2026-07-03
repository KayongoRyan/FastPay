import type { BillCategoryId } from "@/lib/bills/types";
import { parseAmountRwf } from "@/lib/bills/utils";

export interface AddBillForm {
  label: string;
  categoryId: BillCategoryId;
  amount: string;
  paidAt: string;
}

export function validateAddBillForm(form: AddBillForm): string | null {
  const label = form.label.trim();
  if (!label) {
    return "Enter a bill name.";
  }

  const amountRwf = parseAmountRwf(form.amount);
  if (amountRwf <= 0) {
    return "Enter a valid amount.";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.paidAt)) {
    return "Use date format YYYY-MM-DD.";
  }

  const parsed = new Date(`${form.paidAt}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return "Enter a valid date.";
  }

  return null;
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { createBillId, groupPaymentsByMonth } from "@/lib/bills/utils";
import { SEED_BILL_PAYMENTS } from "@/lib/bills/seed";
import type { BillCategoryId, BillMonthSummary, BillPayment } from "@/lib/bills/types";

const STORAGE_KEY = "fastpay_bill_payments";
const SEEDED_KEY = "fastpay_bill_payments_seeded";

export interface NewBillInput {
  label: string;
  categoryId: BillCategoryId;
  amountRwf: number;
  paidAt: string;
}

interface BillsState {
  payments: BillPayment[];
  isReady: boolean;
  isSaving: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  addPayment: (input: NewBillInput) => Promise<BillPayment | null>;
  removePayment: (id: string) => Promise<boolean>;
  getMonths: () => BillMonthSummary[];
}

async function persistPayments(payments: BillPayment[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
}

function parsePayments(raw: string | null): BillPayment[] {
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as BillPayment[];
  } catch {
    return [];
  }
}

export const useBillsStore = create<BillsState>((set, get) => ({
  payments: [],
  isReady: false,
  isSaving: false,
  error: null,

  initialize: async () => {
    const [raw, seeded] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(SEEDED_KEY),
    ]);

    let payments = parsePayments(raw);

    if (!seeded && payments.length === 0) {
      payments = SEED_BILL_PAYMENTS;
      await Promise.all([
        persistPayments(payments),
        AsyncStorage.setItem(SEEDED_KEY, "1"),
      ]);
    }

    set({ payments, isReady: true, error: null });
  },

  addPayment: async (input) => {
    const payment: BillPayment = {
      id: createBillId(),
      categoryId: input.categoryId,
      label: input.label.trim(),
      amountRwf: input.amountRwf,
      paidAt: input.paidAt,
    };

    set({ isSaving: true, error: null });

    try {
      const payments = [payment, ...get().payments];
      await persistPayments(payments);
      set({ payments, isSaving: false });
      return payment;
    } catch {
      set({ isSaving: false, error: "Could not save bill." });
      return null;
    }
  },

  removePayment: async (id) => {
    set({ isSaving: true, error: null });

    try {
      const payments = get().payments.filter((item) => item.id !== id);
      await persistPayments(payments);
      set({ payments, isSaving: false });
      return true;
    } catch {
      set({ isSaving: false, error: "Could not remove bill." });
      return false;
    }
  },

  getMonths: () => groupPaymentsByMonth(get().payments),
}));

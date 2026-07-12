import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import {
  createFamilyPlanId,
  evaluateFamilyPlan,
  type FamilyChildPlan,
  type LockPeriodYears,
} from "@/lib/analytics/family-plan";

const STORAGE_KEY = "fastpay_family_plans";

interface FamilyPlanState {
  plans: FamilyChildPlan[];
  isReady: boolean;
  isSaving: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  addPlan: (input: {
    name: string;
    targetRwf: number;
    lockYears: LockPeriodYears;
  }) => Promise<void>;
  contribute: (planId: string, amountRwf: number) => Promise<void>;
  withdraw: (planId: string, amountRwf: number) => Promise<boolean>;
  deletePlan: (planId: string) => Promise<void>;
}

function parsePlans(raw: string | null): FamilyChildPlan[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as FamilyChildPlan[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function persist(plans: FamilyChildPlan[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

export const useFamilyPlanStore = create<FamilyPlanState>((set, get) => ({
  plans: [],
  isReady: false,
  isSaving: false,
  error: null,

  initialize: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    set({ plans: parsePlans(raw), isReady: true, error: null });
  },

  addPlan: async (input) => {
    set({ isSaving: true, error: null });

    try {
      const plan: FamilyChildPlan = {
        id: createFamilyPlanId(),
        name: input.name.trim(),
        targetRwf: Math.max(input.targetRwf, 0),
        savedRwf: 0,
        lockYears: input.lockYears,
        createdAt: new Date().toISOString(),
      };
      const plans = [...get().plans, plan];
      await persist(plans);
      set({ plans, isSaving: false });
    } catch {
      set({ isSaving: false, error: "Could not create family plan." });
    }
  },

  contribute: async (planId, amountRwf) => {
    const amount = Math.max(amountRwf, 0);
    if (amount <= 0) {
      return;
    }

    set({ isSaving: true, error: null });

    try {
      const plans = get().plans.map((plan) =>
        plan.id === planId
          ? { ...plan, savedRwf: plan.savedRwf + amount }
          : plan,
      );
      await persist(plans);
      set({ plans, isSaving: false });
    } catch {
      set({ isSaving: false, error: "Could not add savings." });
    }
  },

  withdraw: async (planId, amountRwf) => {
    const amount = Math.max(amountRwf, 0);
    if (amount <= 0) {
      return false;
    }

    const plan = get().plans.find((item) => item.id === planId);
    if (!plan) {
      return false;
    }

    const status = evaluateFamilyPlan(plan);
    if (status.isLocked || plan.savedRwf < amount) {
      set({ error: "Savings are locked until the unlock date." });
      return false;
    }

    set({ isSaving: true, error: null });

    try {
      const plans = get().plans.map((item) =>
        item.id === planId
          ? { ...item, savedRwf: Math.max(item.savedRwf - amount, 0) }
          : item,
      );
      await persist(plans);
      set({ plans, isSaving: false, error: null });
      return true;
    } catch {
      set({ isSaving: false, error: "Could not withdraw savings." });
      return false;
    }
  },

  deletePlan: async (planId) => {
    set({ isSaving: true, error: null });

    try {
      const plans = get().plans.filter((plan) => plan.id !== planId);
      await persist(plans);
      set({ plans, isSaving: false });
    } catch {
      set({ isSaving: false, error: "Could not delete family plan." });
    }
  },
}));

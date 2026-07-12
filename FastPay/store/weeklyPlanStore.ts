import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import {
  createEmptyPlan,
  type WeeklyPlan,
} from "@/lib/analytics/weekly-plan";

const STORAGE_KEY = "fastpay_weekly_plans";

interface WeeklyPlanState {
  plans: Record<string, WeeklyPlan>;
  isReady: boolean;
  isSaving: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  getPlanForWeek: (weekKey: string) => WeeklyPlan;
  savePlan: (plan: WeeklyPlan) => Promise<void>;
}

function parsePlans(raw: string | null): Record<string, WeeklyPlan> {
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as Record<string, WeeklyPlan>;
  } catch {
    return {};
  }
}

async function persistPlans(plans: Record<string, WeeklyPlan>) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

export const useWeeklyPlanStore = create<WeeklyPlanState>((set, get) => ({
  plans: {},
  isReady: false,
  isSaving: false,
  error: null,

  initialize: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    set({ plans: parsePlans(raw), isReady: true, error: null });
  },

  getPlanForWeek: (weekKey) => {
    return get().plans[weekKey] ?? createEmptyPlan(weekKey);
  },

  savePlan: async (plan) => {
    set({ isSaving: true, error: null });

    try {
      const plans = { ...get().plans, [plan.weekKey]: plan };
      await persistPlans(plans);
      set({ plans, isSaving: false });
    } catch {
      set({ isSaving: false, error: "Could not save weekly plan." });
    }
  },
}));

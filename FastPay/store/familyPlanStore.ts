import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import {
  createDefaultFamilySettings,
  createFamilyContributionId,
  createFamilyPlanId,
  evaluateFamilyIncomeAllocation,
  evaluateFamilyPlan,
  getYearlyIncomeRwf,
  validateFamilyContribution,
  type FamilyChildPlan,
  type FamilyContribution,
  type FamilyPlanData,
  type FamilyPlanSettings,
  type LockPeriodYears,
  type YearlyIncomePercent,
} from "@/lib/analytics/family-plan";
import type { WeeklyFinanceSources } from "@/lib/analytics/weekly";

const STORAGE_KEY = "fastpay_family_plans";

interface FamilyPlanState {
  settings: FamilyPlanSettings;
  plans: FamilyChildPlan[];
  contributions: FamilyContribution[];
  isReady: boolean;
  isSaving: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  saveSettings: (settings: FamilyPlanSettings) => Promise<void>;
  addPlan: (input: {
    name: string;
    targetRwf: number;
    lockYears: LockPeriodYears;
  }) => Promise<void>;
  contribute: (
    planId: string,
    amountRwf: number,
    sources: WeeklyFinanceSources,
  ) => Promise<boolean>;
  withdraw: (planId: string, amountRwf: number) => Promise<boolean>;
  deletePlan: (planId: string) => Promise<void>;
}

function parseStored(raw: string | null): FamilyPlanData {
  if (!raw) {
    return {
      settings: createDefaultFamilySettings(),
      plans: [],
      contributions: [],
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<FamilyPlanData> | FamilyChildPlan[];

    if (Array.isArray(parsed)) {
      return {
        settings: createDefaultFamilySettings(),
        plans: parsed,
        contributions: [],
      };
    }

    return {
      settings: parsed.settings ?? createDefaultFamilySettings(),
      plans: Array.isArray(parsed.plans) ? parsed.plans : [],
      contributions: Array.isArray(parsed.contributions)
        ? parsed.contributions
        : [],
    };
  } catch {
    return {
      settings: createDefaultFamilySettings(),
      plans: [],
      contributions: [],
    };
  }
}

async function persist(data: FamilyPlanData) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getAllocation(
  settings: FamilyPlanSettings,
  contributions: FamilyContribution[],
  sources: WeeklyFinanceSources,
) {
  const yearlyIncomeRwf = getYearlyIncomeRwf(sources);
  return evaluateFamilyIncomeAllocation({
    yearlyIncomeRwf,
    yearlyPercent: settings.yearlyIncomePercent,
    contributions,
  });
}

export const useFamilyPlanStore = create<FamilyPlanState>((set, get) => ({
  settings: createDefaultFamilySettings(),
  plans: [],
  contributions: [],
  isReady: false,
  isSaving: false,
  error: null,

  initialize: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const data = parseStored(raw);
    set({ ...data, isReady: true, error: null });
  },

  saveSettings: async (settings) => {
    set({ isSaving: true, error: null });

    try {
      const data = {
        settings,
        plans: get().plans,
        contributions: get().contributions,
      };
      await persist(data);
      set({ settings, isSaving: false });
    } catch {
      set({ isSaving: false, error: "Could not save family plan settings." });
    }
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
      const data = {
        settings: get().settings,
        plans,
        contributions: get().contributions,
      };
      await persist(data);
      set({ plans, isSaving: false });
    } catch {
      set({ isSaving: false, error: "Could not create family plan." });
    }
  },

  contribute: async (planId, amountRwf, sources) => {
    const amount = Math.max(amountRwf, 0);
    if (amount <= 0) {
      return false;
    }

    const allocation = getAllocation(
      get().settings,
      get().contributions,
      sources,
    );
    const validation = validateFamilyContribution(amount, allocation);
    if (!validation.valid) {
      set({ error: validation.message ?? "Contribution not allowed." });
      return false;
    }

    set({ isSaving: true, error: null });

    try {
      const contribution: FamilyContribution = {
        id: createFamilyContributionId(),
        planId,
        amountRwf: amount,
        contributedAt: new Date().toISOString(),
      };
      const plans = get().plans.map((plan) =>
        plan.id === planId
          ? { ...plan, savedRwf: plan.savedRwf + amount }
          : plan,
      );
      const contributions = [...get().contributions, contribution];
      const data = {
        settings: get().settings,
        plans,
        contributions,
      };
      await persist(data);
      set({ plans, contributions, isSaving: false, error: null });
      return true;
    } catch {
      set({ isSaving: false, error: "Could not add savings." });
      return false;
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
      const data = {
        settings: get().settings,
        plans,
        contributions: get().contributions,
      };
      await persist(data);
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
      const data = {
        settings: get().settings,
        plans,
        contributions: get().contributions,
      };
      await persist(data);
      set({ plans, isSaving: false });
    } catch {
      set({ isSaving: false, error: "Could not delete family plan." });
    }
  },
}));

export type { YearlyIncomePercent };

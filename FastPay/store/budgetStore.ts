import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import {
  createDefaultBudget,
  type UserBudget,
} from "@/lib/analytics/budget";
import { createGoalId, type SavingsGoal } from "@/lib/analytics/goals";

const STORAGE_KEY = "fastpay_user_budget";

interface BudgetState {
  budget: UserBudget;
  goals: SavingsGoal[];
  isReady: boolean;
  isSaving: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  saveBudget: (budget: UserBudget) => Promise<void>;
  addGoal: (goal: Omit<SavingsGoal, "id" | "createdAt" | "savedRwf">) => Promise<void>;
  updateGoal: (goal: SavingsGoal) => Promise<void>;
  contributeToGoal: (goalId: string, amountRwf: number) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
}

interface PersistedBudgetData {
  budget: UserBudget;
  goals: SavingsGoal[];
}

function parseStored(raw: string | null): PersistedBudgetData {
  if (!raw) {
    return { budget: createDefaultBudget(), goals: [] };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedBudgetData>;
    return {
      budget: parsed.budget ?? createDefaultBudget(),
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
    };
  } catch {
    return { budget: createDefaultBudget(), goals: [] };
  }
}

async function persist(data: PersistedBudgetData) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budget: createDefaultBudget(),
  goals: [],
  isReady: false,
  isSaving: false,
  error: null,

  initialize: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const data = parseStored(raw);
    set({ ...data, isReady: true, error: null });
  },

  saveBudget: async (budget) => {
    set({ isSaving: true, error: null });

    try {
      const nextBudget = {
        ...budget,
        updatedAt: new Date().toISOString(),
      };
      const data = { budget: nextBudget, goals: get().goals };
      await persist(data);
      set({ budget: nextBudget, isSaving: false });
    } catch {
      set({ isSaving: false, error: "Could not save budget." });
    }
  },

  addGoal: async (input) => {
    set({ isSaving: true, error: null });

    try {
      const goal: SavingsGoal = {
        id: createGoalId(),
        name: input.name.trim(),
        type: input.type,
        targetRwf: Math.max(input.targetRwf, 0),
        savedRwf: 0,
        createdAt: new Date().toISOString(),
      };
      const goals = [...get().goals, goal];
      await persist({ budget: get().budget, goals });
      set({ goals, isSaving: false });
    } catch {
      set({ isSaving: false, error: "Could not add goal." });
    }
  },

  updateGoal: async (goal) => {
    set({ isSaving: true, error: null });

    try {
      const goals = get().goals.map((item) =>
        item.id === goal.id ? goal : item,
      );
      await persist({ budget: get().budget, goals });
      set({ goals, isSaving: false });
    } catch {
      set({ isSaving: false, error: "Could not update goal." });
    }
  },

  contributeToGoal: async (goalId, amountRwf) => {
    const amount = Math.max(amountRwf, 0);
    if (amount <= 0) {
      return;
    }

    set({ isSaving: true, error: null });

    try {
      const goals = get().goals.map((goal) =>
        goal.id === goalId
          ? { ...goal, savedRwf: goal.savedRwf + amount }
          : goal,
      );
      await persist({ budget: get().budget, goals });
      set({ goals, isSaving: false });
    } catch {
      set({ isSaving: false, error: "Could not add contribution." });
    }
  },

  deleteGoal: async (goalId) => {
    set({ isSaving: true, error: null });

    try {
      const goals = get().goals.filter((goal) => goal.id !== goalId);
      await persist({ budget: get().budget, goals });
      set({ goals, isSaving: false });
    } catch {
      set({ isSaving: false, error: "Could not delete goal." });
    }
  },
}));

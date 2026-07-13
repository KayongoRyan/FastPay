import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import type {
  AssistantMessageSource,
  RetrievalMeta,
  ValidationResult,
} from "@/lib/assistant/types";

const STORAGE_KEY = "fastpay_assistant_turn_audit";

export interface TurnAuditEntry {
  message: string;
  intent: string;
  confidence: number;
  retrieval?: RetrievalMeta;
  validation?: ValidationResult;
  engine: AssistantMessageSource;
  needsEscalation: boolean;
  ts: string;
}

interface TurnAuditState {
  entries: TurnAuditEntry[];
  isReady: boolean;
  initialize: () => Promise<void>;
  record: (entry: Omit<TurnAuditEntry, "ts">) => Promise<void>;
}

const MAX_ENTRIES = 200;

async function persist(entries: TurnAuditEntry[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
}

export const useAssistantTurnAuditStore = create<TurnAuditState>((set, get) => ({
  entries: [],
  isReady: false,

  initialize: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      set({ isReady: true });
      return;
    }
    try {
      const parsed = JSON.parse(raw) as TurnAuditEntry[];
      set({ entries: parsed, isReady: true });
    } catch {
      set({ isReady: true });
    }
  },

  record: async (entry) => {
    const row: TurnAuditEntry = {
      ...entry,
      ts: new Date().toISOString(),
    };
    const entries = [...get().entries, row].slice(-MAX_ENTRIES);
    set({ entries });
    await persist(entries);
  },
}));

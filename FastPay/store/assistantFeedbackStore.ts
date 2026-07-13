import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import type { AssistantIntent } from "@/lib/assistant/types";
import {
  sendAssistantFeedback,
  type AssistantFeedbackPayload,
} from "@/lib/api/chat";

const STORAGE_KEY = "fastpay_assistant_feedback";

export interface QueuedFeedback extends AssistantFeedbackPayload {
  id: string;
  createdAt: string;
  synced?: boolean;
}

interface FeedbackState {
  queue: QueuedFeedback[];
  isReady: boolean;
  initialize: () => Promise<void>;
  record: (event: Omit<AssistantFeedbackPayload, "messageId"> & { messageId: string }) => Promise<void>;
  syncPending: () => Promise<void>;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function persist(queue: QueuedFeedback[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export const useAssistantFeedbackStore = create<FeedbackState>((set, get) => ({
  queue: [],
  isReady: false,

  initialize: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      set({ isReady: true });
      return;
    }
    try {
      const parsed = JSON.parse(raw) as QueuedFeedback[];
      set({ queue: parsed, isReady: true });
    } catch {
      set({ isReady: true });
    }
  },

  record: async (event) => {
    const entry: QueuedFeedback = {
      ...event,
      id: makeId(),
      createdAt: new Date().toISOString(),
      synced: false,
    };
    const queue = [...get().queue, entry];
    set({ queue });
    await persist(queue);
    await get().syncPending();
  },

  syncPending: async () => {
    const pending = get().queue.filter((item) => !item.synced);
    if (!pending.length) {
      return;
    }

    const updated = [...get().queue];
    for (const item of pending) {
      try {
        await sendAssistantFeedback({
          conversationId: item.conversationId,
          messageId: item.messageId,
          rating: item.rating,
          intent: item.intent,
          confidence: item.confidence,
          chunkIds: item.chunkIds,
          engine: item.engine,
          comment: item.comment,
        });
        const idx = updated.findIndex((q) => q.id === item.id);
        if (idx >= 0) {
          updated[idx] = { ...updated[idx], synced: true };
        }
      } catch {
        // stay queued for next online attempt
      }
    }
    set({ queue: updated });
    await persist(updated);
  },
}));

export type { AssistantIntent };

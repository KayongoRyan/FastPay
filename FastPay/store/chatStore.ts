import { create } from "zustand";

import {
  sendChatMessage,
  type ChatAction,
  type ChatSource,
  type BudgetSnapshotPayload,
} from "@/lib/api/chat";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  actions?: ChatAction[];
};

interface ChatState {
  messages: ChatMessage[];
  conversationId: string | null;
  isLoading: boolean;
  error: string | null;
  sendMessage: (params: {
    message: string;
    currentRoute?: string;
    budgetSnapshot?: BudgetSnapshotPayload;
    walletPublicKey?: string;
  }) => Promise<void>;
  clear: () => void;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  conversationId: null,
  isLoading: false,
  error: null,

  sendMessage: async ({ message, currentRoute, budgetSnapshot, walletPublicKey }) => {
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    const userMessage: ChatMessage = {
      id: makeId(),
      role: "user",
      content: trimmed,
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      const response = await sendChatMessage({
        message: trimmed,
        conversationId: get().conversationId ?? undefined,
        context: {
          currentRoute,
          screenTitle: "Ask FastPay",
          walletPublicKey,
          budgetSnapshot,
        },
      });

      const assistantMessage: ChatMessage = {
        id: makeId(),
        role: "assistant",
        content: response.reply,
        sources: response.sources,
        actions: response.actions,
      };

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        conversationId: response.conversationId,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Could not reach FastPay Assistant. Start assistant-service and gateway.",
      });
    }
  },

  clear: () =>
    set({
      messages: [],
      conversationId: null,
      error: null,
      isLoading: false,
    }),
}));

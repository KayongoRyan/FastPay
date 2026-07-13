import { create } from "zustand";

import {
  buildAssistantContext,
  canUseCloudFallback,
  runAssistantQuery,
  type AssistantMessageSource,
} from "@/lib/assistant";
import { getNetworkStatus } from "@/lib/assistant/connectivity";
import {
  sendChatMessage,
  type ChatAction,
  type ChatSource,
  type BudgetSnapshotPayload,
} from "@/lib/api/chat";
import type { AuthUser } from "@/lib/auth/types";
import { useAssistantStore } from "@/store/assistantStore";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  actions?: ChatAction[];
  engine?: AssistantMessageSource;
  latencyMs?: number;
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
    walletBalanceRwf?: string;
    walletBalanceXlm?: number;
    user?: AuthUser | null;
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

  sendMessage: async ({
    message,
    currentRoute,
    budgetSnapshot,
    walletPublicKey,
    walletBalanceRwf,
    walletBalanceXlm,
    user,
  }) => {
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

    const assistantState = useAssistantStore.getState();
    const isOnline = await getNetworkStatus();

    try {
      const localReply = await runAssistantQuery({
        message: trimmed,
        privacyMode: assistantState.privacyMode,
        isOnline,
        useLocalLlm: assistantState.useLocalLlm,
        context: buildAssistantContext({
          currentRoute,
          screenTitle: "Ask FastPay",
          walletPublicKey,
          walletBalanceRwf,
          walletBalanceXlm,
          budgetSnapshot,
          user,
        }),
      });

      const shouldTryCloud = canUseCloudFallback(
        assistantState.privacyMode,
        assistantState.cloudFallback,
        isOnline,
      );

      if (
        shouldTryCloud &&
        !localReply.usedLlm &&
        localReply.sources.length === 0
      ) {
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
          engine: "cloud",
        };

        set((state) => ({
          messages: [...state.messages, assistantMessage],
          conversationId: response.conversationId,
          isLoading: false,
        }));
        return;
      }

      const assistantMessage: ChatMessage = {
        id: makeId(),
        role: "assistant",
        content: localReply.reply,
        sources: localReply.sources,
        actions: localReply.actions,
        engine: localReply.source,
        latencyMs: localReply.latencyMs,
      };

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Assistant could not answer. Check privacy mode and connectivity.",
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

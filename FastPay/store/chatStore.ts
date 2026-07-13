import { create } from "zustand";

import {
  buildAssistantContext,
  canUseCloudFallback,
  runAssistantQuery,
  shouldEscalateToCloud,
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
import { useAssistantEngagementStore } from "@/store/assistantEngagementStore";
import { useAssistantStore } from "@/store/assistantStore";
import { useAssistantTurnAuditStore } from "@/store/assistantTurnAuditStore";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  actions?: ChatAction[];
  engine?: AssistantMessageSource;
  latencyMs?: number;
  intent?: string;
  confidence?: number;
  chunkIds?: string[];
  conversationId?: string;
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
    walletBalanceUsdt?: string;
    cryptoPortfolioSummary?: string;
    user?: AuthUser | null;
  }) => Promise<void>;
  clear: () => void;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function routeVisitCounts(
  routes: string[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const route of routes) {
    counts[route] = (counts[route] ?? 0) + 1;
  }
  return counts;
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
    walletBalanceUsdt,
    cryptoPortfolioSummary,
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
    const engagementState = useAssistantEngagementStore.getState();
    const auditState = useAssistantTurnAuditStore.getState();
    const isOnline = await getNetworkStatus();

    const recordEngagement = async (intent: string) => {
      await engagementState.recordMessage({
        message: trimmed,
        intent: intent as Parameters<typeof engagementState.recordMessage>[0]["intent"],
        route: currentRoute,
        cashFlow: budgetSnapshot
          ? {
              recordedAt: new Date().toISOString(),
              balanceRwf: walletBalanceRwf,
              balanceUsdt: walletBalanceUsdt,
              monthlyIncomeRwf: budgetSnapshot.monthlyIncomeRwf,
              spendPercent: budgetSnapshot.spendPercent,
              savingsPercent: budgetSnapshot.savingsPercent,
            }
          : undefined,
      });
    };

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
          walletBalanceUsdt,
          cryptoPortfolioSummary,
          engagementSummary: engagementState.getEngagementSummary(),
          budgetSnapshot,
          user,
          routeVisitCounts: routeVisitCounts(engagementState.routesVisited),
        }),
      });

      await auditState.record({
        message: trimmed,
        intent: localReply.intent,
        confidence: localReply.confidence ?? 0,
        retrieval: localReply.retrieval,
        validation: localReply.validation,
        engine: localReply.source,
        needsEscalation: localReply.needsEscalation ?? false,
      });

      const shouldTryCloud = canUseCloudFallback(
        assistantState.privacyMode,
        assistantState.cloudFallback,
        isOnline,
      );

      if (shouldTryCloud && shouldEscalateToCloud(localReply)) {
        const response = await sendChatMessage({
          message: trimmed,
          conversationId: get().conversationId ?? undefined,
          context: {
            currentRoute,
            screenTitle: "Ask FastPay",
            walletPublicKey,
            walletBalanceRwf,
            walletBalanceUsdt,
            cryptoPortfolioSummary,
            engagementSummary: engagementState.getEngagementSummary(),
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
          intent: localReply.intent,
          confidence: response.confidence ?? localReply.confidence,
          conversationId: response.conversationId,
        };

        set((state) => ({
          messages: [...state.messages, assistantMessage],
          conversationId: response.conversationId,
          isLoading: false,
        }));
        await recordEngagement(localReply.intent);
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
        intent: localReply.intent,
        confidence: localReply.confidence,
      };

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false,
      }));
      await recordEngagement(localReply.intent);
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

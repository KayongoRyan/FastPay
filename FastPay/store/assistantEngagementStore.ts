import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import type { AssistantIntent } from "@/lib/assistant/types";

const STORAGE_KEY = "fastpay_assistant_engagement";

export interface EngagementTopicCount {
  topic: AssistantIntent | "general";
  count: number;
}

export interface CashFlowSnapshot {
  recordedAt: string;
  balanceRwf?: string;
  balanceUsdt?: string;
  monthlyIncomeRwf?: number;
  spendPercent?: number;
  savingsPercent?: number;
}

interface EngagementState {
  totalMessages: number;
  topTopics: EngagementTopicCount[];
  routesVisited: string[];
  cashFlowHistory: CashFlowSnapshot[];
  lastQuestion: string | null;
  isReady: boolean;
  initialize: () => Promise<void>;
  recordMessage: (params: {
    message: string;
    intent: AssistantIntent;
    route?: string;
    cashFlow?: CashFlowSnapshot;
  }) => Promise<void>;
  recordRouteVisit: (route: string) => Promise<void>;
  getEngagementSummary: () => string;
}

function bumpTopic(
  topics: EngagementTopicCount[],
  intent: AssistantIntent,
): EngagementTopicCount[] {
  const existing = topics.find((t) => t.topic === intent);
  if (existing) {
    return topics.map((t) =>
      t.topic === intent ? { ...t, count: t.count + 1 } : t,
    );
  }
  return [...topics, { topic: intent, count: 1 }];
}

function topTopicsSorted(topics: EngagementTopicCount[]): EngagementTopicCount[] {
  return [...topics].sort((a, b) => b.count - a.count).slice(0, 5);
}

export const useAssistantEngagementStore = create<EngagementState>((set, get) => ({
  totalMessages: 0,
  topTopics: [],
  routesVisited: [],
  cashFlowHistory: [],
  lastQuestion: null,
  isReady: false,

  initialize: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      set({ isReady: true });
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Partial<EngagementState>;
      set({
        totalMessages: parsed.totalMessages ?? 0,
        topTopics: parsed.topTopics ?? [],
        routesVisited: parsed.routesVisited ?? [],
        cashFlowHistory: parsed.cashFlowHistory ?? [],
        lastQuestion: parsed.lastQuestion ?? null,
        isReady: true,
      });
    } catch {
      set({ isReady: true });
    }
  },

  recordMessage: async ({ message, intent, route, cashFlow }) => {
    const state = get();
    const routesVisited = route
      ? Array.from(new Set([...state.routesVisited, route])).slice(-20)
      : state.routesVisited;
    const cashFlowHistory = cashFlow
      ? [...state.cashFlowHistory, cashFlow].slice(-30)
      : state.cashFlowHistory;

    const next = {
      totalMessages: state.totalMessages + 1,
      topTopics: topTopicsSorted(bumpTopic(state.topTopics, intent)),
      routesVisited,
      cashFlowHistory,
      lastQuestion: message,
      isReady: true,
    };

    set(next);
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        totalMessages: next.totalMessages,
        topTopics: next.topTopics,
        routesVisited: next.routesVisited,
        cashFlowHistory: next.cashFlowHistory,
        lastQuestion: next.lastQuestion,
      }),
    );
  },

  recordRouteVisit: async (route) => {
    const state = get();
    if (state.routesVisited.includes(route)) {
      return;
    }
    const routesVisited = [...state.routesVisited, route].slice(-20);
    set({ routesVisited });
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        totalMessages: state.totalMessages,
        topTopics: state.topTopics,
        routesVisited,
        cashFlowHistory: state.cashFlowHistory,
        lastQuestion: state.lastQuestion,
      }),
    );
  },

  getEngagementSummary: () => {
    const { totalMessages, topTopics, routesVisited, cashFlowHistory } = get();
    const topicLine =
      topTopics.length > 0
        ? topTopics.map((t) => `${t.topic} (${t.count})`).join(", ")
        : "none yet";
    const routeLine =
      routesVisited.length > 0
        ? routesVisited.slice(-5).join(", ")
        : "none yet";
    const latestCash = cashFlowHistory[cashFlowHistory.length - 1];
    const cashLine = latestCash
      ? `Latest balance ${latestCash.balanceRwf ?? "?"} RWF, income ${latestCash.monthlyIncomeRwf ?? "?"}, spend ${latestCash.spendPercent ?? "?"}%`
      : "No cash-flow snapshots yet";

    return [
      `Messages: ${totalMessages}`,
      `Top topics: ${topicLine}`,
      `Recent screens: ${routeLine}`,
      cashLine,
    ].join("\n");
  },
}));

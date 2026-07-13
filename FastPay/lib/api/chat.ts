import { apiPostAuth } from "./client";

export interface ChatSource {
  title: string;
  source: string;
  route?: string;
}

export interface ChatAction {
  label: string;
  href: string;
}

export interface BudgetSnapshotPayload {
  monthlyIncomeRwf?: number;
  spendPercent?: number;
  savingsPercent?: number;
  goals?: {
    name: string;
    targetRwf: number;
    savedRwf: number;
    deadline?: string;
  }[];
  familyPlan?: {
    yearlyIncomePercent?: number;
    children?: { label: string; lockYears: number; savedRwf: number }[];
  };
}

export interface RetrievalMetaPayload {
  maxScore: number;
  scoreGap: number;
  chunkCount: number;
}

export interface ChatRequestPayload {
  message: string;
  conversationId?: string;
  context?: {
    currentRoute?: string;
    screenTitle?: string;
    walletPublicKey?: string;
    walletBalanceRwf?: string;
    walletBalanceUsdt?: string;
    cryptoPortfolioSummary?: string;
    engagementSummary?: string;
    budgetSnapshot?: BudgetSnapshotPayload;
  };
}

export interface ChatResponsePayload {
  reply: string;
  sources: ChatSource[];
  actions: ChatAction[];
  conversationId: string;
  retrievalMeta?: RetrievalMetaPayload;
  confidence?: number;
}

export interface AssistantFeedbackPayload {
  conversationId?: string;
  messageId: string;
  rating: 1 | -1;
  intent: string;
  confidence: number;
  chunkIds?: string[];
  engine: "local" | "cloud";
  comment?: string;
}

export async function sendChatMessage(
  payload: ChatRequestPayload,
): Promise<ChatResponsePayload> {
  return apiPostAuth<ChatResponsePayload>("/assistant/chat", payload);
}

export async function sendAssistantFeedback(
  payload: AssistantFeedbackPayload,
): Promise<{ ok: boolean }> {
  return apiPostAuth<{ ok: boolean }>("/assistant/feedback", payload);
}

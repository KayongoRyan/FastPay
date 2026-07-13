import type { ChatAction, ChatSource, BudgetSnapshotPayload } from "@/lib/api/chat";
import type { AuthUser } from "@/lib/auth/types";

export type AssistantPrivacyMode = "private" | "connected";

export type AssistantIntent =
  | "navigate"
  | "balance"
  | "budget"
  | "cash_flow"
  | "planning"
  | "kyc"
  | "passcode"
  | "product_help"
  | "external_info"
  | "general";

export type AssistantMessageSource = "local" | "cloud";

export type ModelDownloadStatus =
  | "idle"
  | "downloading"
  | "ready"
  | "error"
  | "unsupported";

export interface LocalCorpusChunk {
  text: string;
  source: string;
  title: string;
  route?: string;
  category?: string;
  actionRoute?: string;
}

export interface RetrievedLocalChunk extends LocalCorpusChunk {
  score: number;
}

export interface AssistantContext {
  currentRoute?: string;
  screenTitle?: string;
  walletPublicKey?: string;
  walletBalanceXlm?: number;
  walletBalanceRwf?: string;
  walletBalanceUsdt?: string;
  cryptoPortfolioSummary?: string;
  engagementSummary?: string;
  budgetSnapshot?: BudgetSnapshotPayload;
  user?: AuthUser | null;
}

export interface AssistantQueryInput {
  message: string;
  context: AssistantContext;
  privacyMode: AssistantPrivacyMode;
  isOnline: boolean;
  useLocalLlm: boolean;
}

export interface AssistantReply {
  reply: string;
  sources: ChatSource[];
  actions: ChatAction[];
  source: AssistantMessageSource;
  intent: AssistantIntent;
  latencyMs: number;
  usedLlm: boolean;
  usedTools: string[];
}

export interface ToolFetchResult {
  toolId: string;
  title: string;
  snippets: string[];
}

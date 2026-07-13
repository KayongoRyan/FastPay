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

export type IntentMethod = "regex" | "centroid";

export type ExtractedAsset = "USDT" | "BTC" | "SOL";
export type ExtractedAction = "transfer" | "save" | "loan";

export interface ExtractedEntities {
  amountRwf?: number;
  asset?: ExtractedAsset;
  timeframe?: string;
  action?: ExtractedAction;
}

export interface UserProfile {
  incomeRwf?: number;
  spendPercent?: number;
  savingsPercent?: number;
  topIntents: string[];
  portfolio: string;
  riskFlags: string[];
  routeVisitCounts: Record<string, number>;
  summaryChunk: string;
}

export interface IntentResult {
  intent: AssistantIntent;
  confidence: number;
  method: IntentMethod;
}

export interface RetrievalMeta {
  maxScore: number;
  scoreGap: number;
  chunkCount: number;
}

export interface ValidationResult {
  ok: boolean;
  reasons: string[];
  downgradedConfidence: boolean;
  strippedActions: number;
  refused: boolean;
}

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
  extractedEntities?: ExtractedEntities;
  userProfile?: UserProfile;
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
  confidence?: number;
  retrieval?: RetrievalMeta;
  validation?: ValidationResult;
  needsEscalation?: boolean;
}

export interface ToolFetchResult {
  toolId: string;
  title: string;
  snippets: string[];
}

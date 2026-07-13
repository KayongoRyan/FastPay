export { buildAssistantContext, contextToPromptSection } from "./context-builder";
export { tryFastAnswer } from "./fast-answers";
export { classifyIntent, classifyIntentResult } from "./intent-router";
export { runAssistantQuery } from "./orchestrator";
export { shouldEscalateToCloud } from "./ml/escalation";
export {
  canUseCloudFallback,
  canUseExternalTools,
  redactForExternalFetch,
} from "./privacy";
export { retrieveLocalChunks, getCorpusChunkCount } from "./local-rag/retriever";
export {
  generateLocalAnswer,
  isLocalLlmSupported,
  prepareLocalLlm,
} from "./llm/platform";
export type {
  AssistantContext,
  AssistantIntent,
  AssistantMessageSource,
  AssistantPrivacyMode,
  AssistantQueryInput,
  AssistantReply,
  IntentResult,
  ModelDownloadStatus,
  RetrievalMeta,
  ValidationResult,
} from "./types";

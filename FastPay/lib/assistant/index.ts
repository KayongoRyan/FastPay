export { buildAssistantContext, contextToPromptSection } from "./context-builder";
export { tryFastAnswer } from "./fast-answers";
export { classifyIntent } from "./intent-router";
export { runAssistantQuery } from "./orchestrator";
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
  ModelDownloadStatus,
} from "./types";

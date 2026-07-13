import type { AssistantReply, RetrievalMeta } from "../types";

import { CLOUD_ESCALATION_THRESHOLD, RETRIEVAL_LOW } from "./config";
import { retrievalConfidence } from "./retrieval-confidence";

export function combineConfidence(
  intentConfidence: number,
  retrieval: RetrievalMeta | undefined,
): number {
  if (!retrieval || retrieval.chunkCount === 0) {
    return intentConfidence * 0.5;
  }
  return Math.max(
    0,
    Math.min(1, intentConfidence * retrievalConfidence(retrieval)),
  );
}

export function shouldEscalateToCloud(localReply: AssistantReply): boolean {
  if (localReply.needsEscalation) {
    return true;
  }
  const confidence = localReply.confidence ?? 0;
  if (confidence < CLOUD_ESCALATION_THRESHOLD) {
    return true;
  }
  if (
    localReply.retrieval != null &&
    localReply.retrieval.maxScore < RETRIEVAL_LOW
  ) {
    return true;
  }
  return false;
}

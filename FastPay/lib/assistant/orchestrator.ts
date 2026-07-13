import { classifyIntentResult } from "./intent-router";
import { tryFastAnswer } from "./fast-answers";
import { retrieveLocalChunks } from "./local-rag/retriever";
import { chunksToTemplateReply } from "./local-rag/template";
import { generateLocalAnswer } from "./llm/platform";
import { validateAnswer } from "./ml/answer-validator";
import { extractEntities } from "./ml/entity-extractor";
import {
  combineConfidence,
  shouldEscalateToCloud,
} from "./ml/escalation";
import { MONEY_INTENTS, RETRIEVAL_LOW } from "./ml/config";
import {
  computeRetrievalMeta,
  isLowRetrieval,
} from "./ml/retrieval-confidence";
import { buildUserProfile } from "./ml/user-profile";
import { canUseExternalTools } from "./privacy";
import { runTools } from "./tools/registry";
import type { AssistantQueryInput, AssistantReply } from "./types";

function finalizeReply(
  reply: AssistantReply,
  input: AssistantQueryInput,
  corpusWasRetrieved: boolean,
): AssistantReply {
  const validated = validateAnswer(reply, input.context, { corpusWasRetrieved });
  if (shouldEscalateToCloud(validated)) {
    validated.needsEscalation = true;
  }
  return validated;
}

export async function runAssistantQuery(
  input: AssistantQueryInput,
): Promise<AssistantReply> {
  const started = Date.now();
  const context = { ...input.context };

  context.extractedEntities = extractEntities(input.message);
  if (!context.userProfile) {
    context.userProfile = buildUserProfile(context);
  }

  const intentResult = classifyIntentResult(input.message);
  const intent = intentResult.intent;

  if (MONEY_INTENTS.has(intent)) {
    const fast = tryFastAnswer(intent, input.message, context);
    if (fast) {
      fast.confidence = Math.max(fast.confidence ?? 0.9, intentResult.confidence);
      return finalizeReply(fast, { ...input, context }, false);
    }
  }

  const fast = tryFastAnswer(intent, input.message, context);
  if (fast) {
    fast.confidence = Math.max(fast.confidence ?? 0.9, intentResult.confidence);
    return finalizeReply(fast, { ...input, context }, false);
  }

  if (intent === "external_info" && !canUseExternalTools(input.privacyMode)) {
    return finalizeReply(
      {
        reply:
          "Live external lookups (FX, Horizon, government FAQs) require Connected mode. Switch in Settings → Assistant, or ask about FastPay features offline.",
        sources: [{ title: "Privacy", source: "local/privacy" }],
        actions: [{ label: "Open Settings", href: "/settings" }],
        source: "local",
        intent,
        latencyMs: Date.now() - started,
        usedLlm: false,
        usedTools: [],
        confidence: 0.85,
        needsEscalation: false,
      },
      { ...input, context },
      false,
    );
  }

  const chunks = retrieveLocalChunks(
    input.message,
    5,
    context.currentRoute,
  );
  const retrieval = computeRetrievalMeta(chunks);
  let needsEscalation = isLowRetrieval(retrieval);

  let toolSnippets: string[] = [];
  let usedTools: string[] = [];

  if (canUseExternalTools(input.privacyMode) && input.isOnline) {
    const toolResults = await runTools({
      message: input.message,
      mode: input.privacyMode,
      context,
    });
    usedTools = toolResults.map((t) => t.toolId);
    toolSnippets = toolResults.flatMap((t) =>
      t.snippets.map((s) => `[${t.title}] ${s}`),
    );
  }

  const generated = await generateLocalAnswer(
    {
      message: input.message,
      chunks,
      toolSnippets,
      budgetSnapshot: context.budgetSnapshot,
      currentRoute: context.currentRoute,
    },
    input.useLocalLlm,
  );

  if (!generated.usedLlm && !toolSnippets.length) {
    const template = chunksToTemplateReply(chunks);
    const confidence = combineConfidence(intentResult.confidence, retrieval);
    return finalizeReply(
      {
        ...template,
        source: "local",
        intent,
        latencyMs: Date.now() - started,
        usedLlm: false,
        usedTools,
        confidence,
        retrieval,
        needsEscalation: needsEscalation || confidence < 0.55,
      },
      { ...input, context },
      chunks.length > 0,
    );
  }

  const confidence = combineConfidence(intentResult.confidence, retrieval);

  return finalizeReply(
    {
      reply: generated.reply,
      sources: generated.sources,
      actions: generated.actions,
      source: "local",
      intent,
      latencyMs: Date.now() - started,
      usedLlm: generated.usedLlm,
      usedTools,
      confidence,
      retrieval,
      needsEscalation:
        needsEscalation ||
        confidence < 0.55 ||
        retrieval.maxScore < RETRIEVAL_LOW,
    },
    { ...input, context },
    chunks.length > 0,
  );
}

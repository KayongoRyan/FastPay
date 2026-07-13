import { classifyIntent } from "./intent-router";
import { tryFastAnswer } from "./fast-answers";
import { retrieveLocalChunks } from "./local-rag/retriever";
import { chunksToTemplateReply } from "./local-rag/template";
import { generateLocalAnswer } from "./llm/platform";
import { canUseExternalTools } from "./privacy";
import { runTools } from "./tools/registry";
import type { AssistantQueryInput, AssistantReply } from "./types";

export async function runAssistantQuery(
  input: AssistantQueryInput,
): Promise<AssistantReply> {
  const started = Date.now();
  const intent = classifyIntent(input.message);

  const fast = tryFastAnswer(intent, input.message, input.context);
  if (fast) {
    return fast;
  }

  if (intent === "external_info" && !canUseExternalTools(input.privacyMode)) {
    return {
      reply:
        "Live external lookups (FX, Horizon, government FAQs) require Connected mode. Switch in Settings → Assistant, or ask about FastPay features offline.",
      sources: [{ title: "Privacy", source: "local/privacy" }],
      actions: [{ label: "Open Settings", href: "/settings" }],
      source: "local",
      intent,
      latencyMs: Date.now() - started,
      usedLlm: false,
      usedTools: [],
    };
  }

  const chunks = retrieveLocalChunks(
    input.message,
    5,
    input.context.currentRoute,
  );

  let toolSnippets: string[] = [];
  let usedTools: string[] = [];

  if (canUseExternalTools(input.privacyMode) && input.isOnline) {
    const toolResults = await runTools({
      message: input.message,
      mode: input.privacyMode,
      context: input.context,
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
      budgetSnapshot: input.context.budgetSnapshot,
      currentRoute: input.context.currentRoute,
    },
    input.useLocalLlm,
  );

  if (!generated.usedLlm && !toolSnippets.length) {
    const template = chunksToTemplateReply(chunks);
    return {
      ...template,
      source: "local",
      intent,
      latencyMs: Date.now() - started,
      usedLlm: false,
      usedTools,
    };
  }

  return {
    reply: generated.reply,
    sources: generated.sources,
    actions: generated.actions,
    source: "local",
    intent,
    latencyMs: Date.now() - started,
    usedLlm: generated.usedLlm,
    usedTools,
  };
}

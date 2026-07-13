import { Platform } from "react-native";

import { chunksToTemplateReply } from "../local-rag/template";
import { buildSystemPrompt, buildUserPrompt, parseLlmJson } from "./prompt";
import type { RetrievedLocalChunk } from "../types";
import type { BudgetSnapshotPayload } from "@/lib/api/chat";

export interface LocalLlmInput {
  message: string;
  chunks: RetrievedLocalChunk[];
  toolSnippets?: string[];
  budgetSnapshot?: BudgetSnapshotPayload;
  currentRoute?: string;
}

export interface LocalLlmResult {
  reply: string;
  sources: { title: string; source: string; route?: string }[];
  actions: { label: string; href: string }[];
  usedLlm: boolean;
}

let webEnginePromise: Promise<{
  generate: (system: string, user: string) => Promise<string>;
}> | null = null;

let nativeEnginePromise: Promise<{
  generate: (system: string, user: string) => Promise<string>;
} | null> | null = null;

async function loadWebEngine() {
  if (Platform.OS !== "web") {
    return null;
  }
  if (!webEnginePromise) {
    webEnginePromise = import("./web-llm").then((m) => m.createWebLlmEngine());
  }
  return webEnginePromise;
}

async function loadNativeEngine() {
  if (Platform.OS === "web") {
    return null;
  }
  if (!nativeEnginePromise) {
    nativeEnginePromise = import("./native-llm").then((m) => m.createNativeLlmEngine());
  }
  return nativeEnginePromise;
}

export async function isLocalLlmSupported(): Promise<boolean> {
  if (Platform.OS === "web") {
    return true;
  }
  const engine = await loadNativeEngine();
  return engine !== null;
}

export async function prepareLocalLlm(): Promise<{
  status: "ready" | "downloading" | "unsupported" | "error";
  message?: string;
}> {
  try {
    if (Platform.OS === "web") {
      await loadWebEngine();
      return { status: "ready" };
    }
    const engine = await loadNativeEngine();
    if (!engine) {
      return {
        status: "unsupported",
        message: "On-device LLM requires a dev build with llama.rn.",
      };
    }
    return { status: "ready" };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Model load failed",
    };
  }
}

export async function generateLocalAnswer(
  input: LocalLlmInput,
  useLlm: boolean,
): Promise<LocalLlmResult> {
  const fallback = chunksToTemplateReply(input.chunks);

  if (!useLlm) {
    return { ...fallback, usedLlm: false };
  }

  const system = buildSystemPrompt();
  const user = buildUserPrompt(input);

  try {
    const engine =
      Platform.OS === "web" ? await loadWebEngine() : await loadNativeEngine();

    if (!engine) {
      return { ...fallback, usedLlm: false };
    }

    const raw = await engine.generate(system, user);
    const parsed = parseLlmJson(raw);

    if (!parsed.sources.length && input.chunks.length) {
      parsed.sources = input.chunks.slice(0, 3).map((chunk) => ({
        title: chunk.title ?? chunk.source,
        source: chunk.source,
        route: chunk.route,
      }));
    }

    return { ...parsed, usedLlm: true };
  } catch {
    return { ...fallback, usedLlm: false };
  }
}

import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

import type { ModelDownloadStatus } from "../types";

let loadStatus: ModelDownloadStatus = "idle";
let context: {
  completion: (
    params: { prompt: string; n_predict: number; temperature: number },
    cb: (data: { token: string }) => void,
  ) => Promise<void>;
} | null = null;

const MODEL_URL =
  "https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf";

export function getNativeLlmStatus(): ModelDownloadStatus {
  return loadStatus;
}

export async function createNativeLlmEngine(): Promise<{
  generate: (system: string, user: string) => Promise<string>;
} | null> {
  if (Platform.OS === "web") {
    return null;
  }

  try {
    const llama = await import("llama.rn");
    const { initLlama } = llama;

    if (!context) {
      loadStatus = "downloading";
      const modelPath = await ensureModelDownloaded();
      const llamaContext = await initLlama({
        model: modelPath,
        n_ctx: 2048,
        n_gpu_layers: Platform.OS === "ios" ? 99 : 0,
      });
      context = llamaContext;
      loadStatus = "ready";
    }

    return {
      generate: async (system: string, user: string) => {
        if (!context) {
          throw new Error("Native LLM not initialized");
        }

        const prompt = `${system}\n\n${user}\n\nAssistant JSON:`;
        let output = "";

        await context.completion(
          { prompt, n_predict: 512, temperature: 0.2 },
          (data) => {
            output += data.token;
          },
        );

        return output.trim() || "{}";
      },
    };
  } catch {
    loadStatus = "unsupported";
    return null;
  }
}

async function ensureModelDownloaded(): Promise<string> {
  const dir = `${FileSystem.documentDirectory}models/`;
  const path = `${dir}phi-3-mini-q4.gguf`;

  const info = await FileSystem.getInfoAsync(path);
  if (info.exists) {
    return path;
  }

  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });

  const download = FileSystem.createDownloadResumable(MODEL_URL, path);
  const result = await download.downloadAsync();
  if (!result?.uri) {
    throw new Error("Model download failed");
  }

  return result.uri;
}

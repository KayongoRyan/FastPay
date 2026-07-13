import type { ModelDownloadStatus } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let engine: any = null;
let loadStatus: ModelDownloadStatus = "idle";

const MODEL_ID = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

export function getWebLlmStatus(): ModelDownloadStatus {
  return loadStatus;
}

export async function createWebLlmEngine(): Promise<{
  generate: (system: string, user: string) => Promise<string>;
}> {
  if (typeof window === "undefined") {
    throw new Error("WebLLM is only available in the browser");
  }

  if (!engine) {
    loadStatus = "downloading";
    const { CreateMLCEngine } = await import("@mlc-ai/web-llm");
    engine = await CreateMLCEngine(MODEL_ID, {
      initProgressCallback: () => {
        loadStatus = "downloading";
      },
    });
    loadStatus = "ready";
  }

  return {
    generate: async (system: string, user: string) => {
      if (!engine) {
        throw new Error("WebLLM engine not initialized");
      }

      const response = await engine.chat.completions.create({
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.2,
        max_tokens: 512,
        response_format: { type: "json_object" },
      });

      return response.choices[0]?.message?.content ?? "{}";
    },
  };
}

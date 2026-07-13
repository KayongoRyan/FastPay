import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { create } from "zustand";

import {
  isLocalLlmSupported,
  prepareLocalLlm,
  type AssistantPrivacyMode,
  type ModelDownloadStatus,
} from "@/lib/assistant";

const PRIVACY_KEY = "fastpay_assistant_privacy";
const CLOUD_FALLBACK_KEY = "fastpay_assistant_cloud_fallback";
const USE_LOCAL_LLM_KEY = "fastpay_assistant_use_local_llm";

interface AssistantState {
  privacyMode: AssistantPrivacyMode;
  cloudFallback: boolean;
  useLocalLlm: boolean;
  modelStatus: ModelDownloadStatus;
  modelMessage: string | null;
  isReady: boolean;
  initialize: () => Promise<void>;
  setPrivacyMode: (mode: AssistantPrivacyMode) => Promise<void>;
  setCloudFallback: (enabled: boolean) => Promise<void>;
  setUseLocalLlm: (enabled: boolean) => Promise<void>;
  downloadModel: () => Promise<void>;
}

export const useAssistantStore = create<AssistantState>((set, get) => ({
  privacyMode: "private",
  cloudFallback: false,
  useLocalLlm: true,
  modelStatus: "idle",
  modelMessage: null,
  isReady: false,

  initialize: async () => {
    const [privacyRaw, cloudRaw, llmRaw] = await Promise.all([
      AsyncStorage.getItem(PRIVACY_KEY),
      AsyncStorage.getItem(CLOUD_FALLBACK_KEY),
      AsyncStorage.getItem(USE_LOCAL_LLM_KEY),
    ]);

    const supported = await isLocalLlmSupported();

    set({
      privacyMode:
        privacyRaw === "connected" ? "connected" : "private",
      cloudFallback: cloudRaw === "true",
      useLocalLlm: llmRaw !== "false",
      modelStatus: supported ? "idle" : "unsupported",
      isReady: true,
    });
  },

  setPrivacyMode: async (mode) => {
    await AsyncStorage.setItem(PRIVACY_KEY, mode);
    set({
      privacyMode: mode,
      cloudFallback: mode === "private" ? false : get().cloudFallback,
    });
    if (mode === "private") {
      await AsyncStorage.setItem(CLOUD_FALLBACK_KEY, "false");
      set({ cloudFallback: false });
    }
  },

  setCloudFallback: async (enabled) => {
    if (get().privacyMode === "private") {
      return;
    }
    await AsyncStorage.setItem(CLOUD_FALLBACK_KEY, String(enabled));
    set({ cloudFallback: enabled });
  },

  setUseLocalLlm: async (enabled) => {
    await AsyncStorage.setItem(USE_LOCAL_LLM_KEY, String(enabled));
    set({ useLocalLlm: enabled });
  },

  downloadModel: async () => {
    set({ modelStatus: "downloading", modelMessage: null });
    const result = await prepareLocalLlm();
    set({
      modelStatus: result.status,
      modelMessage: result.message ?? null,
    });
  },
}));

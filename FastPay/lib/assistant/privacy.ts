import type { AssistantPrivacyMode } from "./types";

export function canUseExternalTools(mode: AssistantPrivacyMode): boolean {
  return mode === "connected";
}

export function canUseCloudFallback(
  mode: AssistantPrivacyMode,
  cloudFallback: boolean,
  isOnline: boolean,
): boolean {
  return mode === "connected" && cloudFallback && isOnline;
}

/** Strip emails and long digit sequences before external tool queries. */
export function redactForExternalFetch(text: string): string {
  return text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/\b\d{10,}\b/g, "[phone]")
    .replace(/G[A-Z0-9]{55}/g, "[stellar-key]");
}

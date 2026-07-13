import AsyncStorage from "@react-native-async-storage/async-storage";

import type { ToolFetchResult } from "../types";

const CACHE_KEY = "fastpay_fx_rates_cache";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface FxCache {
  fetchedAt: number;
  usdToRwf: number;
  eurToRwf: number;
}

async function readCache(): Promise<FxCache | null> {
  const raw = await AsyncStorage.getItem(CACHE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as FxCache;
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function writeCache(cache: FxCache): Promise<void> {
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

async function fetchWithTimeout(url: string, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Frankfurter API — free, no key. Falls back to bundled estimates. */
export async function fetchFxRates(): Promise<ToolFetchResult | null> {
  const cached = await readCache();
  if (cached) {
    return {
      toolId: "fx_rates",
      title: "Exchange rates (cached)",
      snippets: [
        `USD/RWF ≈ ${cached.usdToRwf.toLocaleString()} (indicative)`,
        `EUR/RWF ≈ ${cached.eurToRwf.toLocaleString()} (indicative)`,
      ],
    };
  }

  try {
    const [usdRes, eurRes] = await Promise.all([
      fetchWithTimeout("https://api.frankfurter.app/latest?from=USD&to=RWF"),
      fetchWithTimeout("https://api.frankfurter.app/latest?from=EUR&to=RWF"),
    ]);

    const usdBody = (await usdRes.json()) as { rates?: { RWF?: number } };
    const eurBody = (await eurRes.json()) as { rates?: { RWF?: number } };

    const usdToRwf = usdBody.rates?.RWF ?? 1300;
    const eurToRwf = eurBody.rates?.RWF ?? 1400;

    await writeCache({ fetchedAt: Date.now(), usdToRwf, eurToRwf });

    return {
      toolId: "fx_rates",
      title: "Exchange rates",
      snippets: [
        `USD/RWF ≈ ${usdToRwf.toLocaleString()} (Frankfurter, indicative)`,
        `EUR/RWF ≈ ${eurToRwf.toLocaleString()} (Frankfurter, indicative)`,
      ],
    };
  } catch {
    return {
      toolId: "fx_rates",
      title: "Exchange rates (offline estimate)",
      snippets: [
        "USD/RWF ≈ 1,300 (bundled estimate — enable network for live rates)",
        "EUR/RWF ≈ 1,400 (bundled estimate)",
      ],
    };
  }
}

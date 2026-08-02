import { getApiBaseUrl } from "@/lib/api/config";

import {
  clearPortalSession,
  isTokenExpired,
  loadPortalAccessToken,
  loadPortalRefreshToken,
  savePortalSession,
} from "./storage";
import type { PortalKind, PortalTokens, PortalUser } from "./types";

type ApiErrorBody = { message?: string | string[]; error?: string };

function extractMessage(body: ApiErrorBody, fallback: string) {
  if (Array.isArray(body.message)) return body.message.join(". ");
  if (typeof body.message === "string") return body.message;
  if (body.error) return body.error;
  return fallback;
}

async function refreshPortalToken(kind: PortalKind): Promise<string | null> {
  const refreshToken = await loadPortalRefreshToken(kind);
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Platform": "expo",
      },
      body: JSON.stringify({ refreshToken }),
    });
    const data = (await res.json().catch(() => ({}))) as PortalTokens & ApiErrorBody;
    if (!res.ok || !data.accessToken || !data.refreshToken) return null;

    const userRaw = await import("./storage").then((m) => m.loadPortalUser(kind));
    if (userRaw) {
      await savePortalSession(kind, userRaw, {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
        sessionId: data.sessionId,
      });
    }
    return data.accessToken;
  } catch {
    return null;
  }
}

async function ensureAccessToken(kind: PortalKind): Promise<string | null> {
  const token = await loadPortalAccessToken(kind);
  if (!token) return null;
  if (!isTokenExpired(token)) return token;
  return refreshPortalToken(kind);
}

export async function portalRequest<T>(
  kind: PortalKind,
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Platform": "expo",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (options.auth) {
    const token = await ensureAccessToken(kind);
    if (!token) {
      await clearPortalSession(kind);
      throw new Error("Session expired. Please sign in again.");
    }
    headers.Authorization = `Bearer ${token}`;
  }

  let res = await fetch(`${getApiBaseUrl()}${path}`, { ...options, headers });

  if (options.auth && res.status === 401) {
    const refreshed = await refreshPortalToken(kind);
    if (refreshed) {
      headers.Authorization = `Bearer ${refreshed}`;
      res = await fetch(`${getApiBaseUrl()}${path}`, { ...options, headers });
    }
  }

  const data = (await res.json().catch(() => ({}))) as ApiErrorBody & T;
  if (!res.ok) {
    if (options.auth && res.status === 401) {
      await clearPortalSession(kind);
      throw new Error("Session expired. Please sign in again.");
    }
    throw new Error(extractMessage(data, `Request failed (${res.status})`));
  }
  return data as T;
}

export async function portalLogin(
  kind: PortalKind,
  identifier: string,
  password: string,
): Promise<{ user: PortalUser; tokens: PortalTokens }> {
  return portalRequest(kind, "/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
}

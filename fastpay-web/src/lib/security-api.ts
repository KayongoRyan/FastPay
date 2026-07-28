import { readAccessToken } from "./auth-api";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type ApiErrorBody = {
  message?: string | string[];
  error?: string;
};

function extractMessage(body: ApiErrorBody, fallback: string) {
  if (Array.isArray(body.message)) return body.message.join(". ");
  if (typeof body.message === "string") return body.message;
  if (body.error) return body.error;
  return fallback;
}

async function requestJson<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (options.auth) {
    const token = readAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = (await res.json().catch(() => ({}))) as ApiErrorBody & T;

  if (!res.ok) {
    throw new Error(extractMessage(data, `Request failed (${res.status})`));
  }

  return data as T;
}

export type SecuritySession = {
  sessionId: string;
  deviceLabel: string;
  platform?: string;
  ipAddress?: string;
  lastActiveAt?: string;
  createdAt?: string;
  current?: boolean;
};

export type SecurityAlert = {
  id: string;
  type: string;
  title: string;
  detail?: string;
  body?: string;
  read: boolean;
  createdAt: string;
};

export function fetchSecuritySessions() {
  return requestJson<{ sessions: SecuritySession[] }>("/security/sessions", {
    auth: true,
  });
}

export function fetchSecurityAlerts(limit = 20) {
  return requestJson<{ alerts: SecurityAlert[] }>(
    `/security/alerts?limit=${limit}`,
    { auth: true },
  );
}

export function revokeSecuritySession(sessionId: string) {
  return requestJson<{ revoked: boolean }>(`/security/sessions/${sessionId}`, {
    method: "DELETE",
    auth: true,
  });
}

export function revokeOtherSessions() {
  return requestJson<{ revokedCount: number }>("/security/sessions", {
    method: "DELETE",
    auth: true,
  });
}

export function markAlertRead(alertId: string) {
  return requestJson<{ ok: boolean }>(`/security/alerts/${alertId}/read`, {
    method: "PATCH",
    auth: true,
  });
}

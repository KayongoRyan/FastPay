const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type AuthUser = {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResponse = {
  user: AuthUser;
  tokens: AuthTokens;
};

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

async function postJson<T>(path: string, payload: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => ({}))) as ApiErrorBody & T;

  if (!res.ok) {
    throw new Error(extractMessage(data, `Request failed (${res.status})`));
  }

  return data as T;
}

export function loginRequest(identifier: string, password: string) {
  return postJson<AuthResponse>("/auth/login", { identifier, password });
}

export function registerRequest(input: {
  fullName: string;
  password: string;
  email?: string;
  phone?: string;
}) {
  return postJson<AuthResponse>("/auth/register", input);
}

export function persistSession(data: AuthResponse) {
  localStorage.setItem("fastpay_access_token", data.tokens.accessToken);
  localStorage.setItem("fastpay_refresh_token", data.tokens.refreshToken);
  localStorage.setItem("fastpay_user", JSON.stringify(data.user));
}

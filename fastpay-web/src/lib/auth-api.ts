const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type AuthUser = {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  kycLevel?: number;
  kycStatus?: string;
  biometricEnabled?: boolean;
  isActive?: boolean;
  accountType?: "consumer" | "merchant";
  merchantOrgId?: string;
  merchantCode?: string;
  businessName?: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn?: string;
  sessionId?: string;
};

export type AuthResponse = {
  user: AuthUser;
  tokens: AuthTokens;
};

type ApiErrorBody = {
  message?: string | string[];
  error?: string;
};

export class SessionExpiredError extends Error {
  constructor() {
    super("Session expired. Please log in again.");
    this.name = "SessionExpiredError";
  }
}

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

  let res: Response;
  try {
    res = options.auth
      ? await authorizedFetch(path, { ...options, headers })
      : await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error(
      "Cannot reach FastPay API. Start the gateway (npm run start:gateway) and auth service (npm run start:auth), then retry.",
    );
  }

  const data = (await res.json().catch(() => ({}))) as ApiErrorBody & T;

  if (!res.ok) {
    if (res.status === 401 && options.auth) {
      clearSession();
      throw new SessionExpiredError();
    }
    throw new Error(extractMessage(data, `Request failed (${res.status})`));
  }

  return data as T;
}

export function loginRequest(identifier: string, password: string) {
  return requestJson<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
}

export function registerRequest(input: {
  fullName: string;
  password: string;
  email?: string;
  phone?: string;
}) {
  return requestJson<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchProfile() {
  return requestJson<AuthUser>("/auth/me", { method: "GET", auth: true });
}

export function changePasswordRequest(currentPassword: string, newPassword: string) {
  return requestJson<{ success?: boolean }>("/auth/change-password", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export function freezeAccountRequest() {
  return requestJson<{ success?: boolean; frozenUntil?: string }>("/auth/freeze-account", {
    method: "POST",
    auth: true,
  });
}

export function unfreezeAccountRequest() {
  return requestJson<{ success?: boolean }>("/auth/unfreeze-account", {
    method: "POST",
    auth: true,
  });
}

export function logoutRequest() {
  return requestJson<{ success?: boolean }>("/auth/logout", {
    method: "POST",
    auth: true,
  }).catch(() => undefined);
}

export function persistSession(data: AuthResponse) {
  localStorage.setItem("fastpay_access_token", data.tokens.accessToken);
  localStorage.setItem("fastpay_refresh_token", data.tokens.refreshToken);
  localStorage.setItem("fastpay_user", JSON.stringify(data.user));
}

export function clearSession() {
  localStorage.removeItem("fastpay_access_token");
  localStorage.removeItem("fastpay_refresh_token");
  localStorage.removeItem("fastpay_user");
}

export function readAccessToken() {
  return localStorage.getItem("fastpay_access_token");
}

export function readRefreshToken() {
  return localStorage.getItem("fastpay_refresh_token");
}

function decodeJwtPayload(token: string): { exp?: number; type?: string } | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    return JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/"))) as {
      exp?: number;
      type?: string;
    };
  } catch {
    return null;
  }
}

let refreshInFlight: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = readRefreshToken();
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const data = (await res.json().catch(() => ({}))) as AuthTokens & ApiErrorBody;
      if (!res.ok) return null;

      localStorage.setItem("fastpay_access_token", data.accessToken);
      localStorage.setItem("fastpay_refresh_token", data.refreshToken);
      return data.accessToken;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

/** Returns a valid access token, refreshing proactively when near expiry. */
export async function ensureAccessToken(): Promise<string | null> {
  const token = readAccessToken();
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  const expiresAtMs = payload?.exp ? payload.exp * 1000 : 0;
  const stillValid = expiresAtMs > Date.now() + 30_000;

  if (stillValid) return token;
  return refreshAccessToken();
}

export async function authorizedFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let token = await ensureAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && readRefreshToken()) {
    token = await refreshAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
      res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    }
  }

  return res;
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem("fastpay_user");
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem("fastpay_settings");
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...(JSON.parse(raw) as UserSettings) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: UserSettings) {
  localStorage.setItem("fastpay_settings", JSON.stringify(settings));
}

export type UserSettings = {
  emailAlerts: boolean;
  pushAlerts: boolean;
  marketingEmail: boolean;
  currency: "RWF" | "USD" | "KES";
  language: "en" | "fr" | "rw";
  hideBalance: boolean;
};

export const defaultSettings: UserSettings = {
  emailAlerts: true,
  pushAlerts: true,
  marketingEmail: false,
  currency: "RWF",
  language: "en",
  hideBalance: false,
};

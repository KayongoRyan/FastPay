const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type BusinessUser = {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  accountType: "consumer" | "merchant" | "business";
  businessOrgId?: string;
  businessCode?: string;
  companyName?: string;
};

export type BusinessOrg = {
  orgId: string;
  businessCode: string;
  companyName: string;
  industry?: string;
  companyEmail?: string;
  companyPhone?: string;
  address?: string;
  country?: string;
  status: string;
  createdAt?: string;
};

export type BusinessBranch = {
  orgId: string;
  merchantCode: string;
  businessName: string;
  totalReceivedRwf: number;
  status: string;
  category?: string;
};

export type BusinessMember = {
  id: string;
  fullName: string;
  email?: string;
  role: "owner" | "admin" | "finance" | "viewer";
  status: "active" | "invited" | "revoked";
  createdAt?: string;
};

type ApiErrorBody = { message?: string | string[]; error?: string };

export class BusinessSessionExpiredError extends Error {
  constructor() {
    super("Session expired. Please sign in again.");
    this.name = "BusinessSessionExpiredError";
  }
}

function extractMessage(body: ApiErrorBody, fallback: string) {
  if (Array.isArray(body.message)) return body.message.join(". ");
  if (typeof body.message === "string") return body.message;
  if (body.error) return body.error;
  return fallback;
}

function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    return JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/"))) as {
      exp?: number;
    };
  } catch {
    return null;
  }
}

function readAccessToken() {
  return localStorage.getItem("fastpay_business_token");
}

function readRefreshToken() {
  return localStorage.getItem("fastpay_business_refresh");
}

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
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
      const data = (await res.json().catch(() => ({}))) as {
        accessToken?: string;
        refreshToken?: string;
      };
      if (!res.ok || !data.accessToken || !data.refreshToken) return null;
      localStorage.setItem("fastpay_business_token", data.accessToken);
      localStorage.setItem("fastpay_business_refresh", data.refreshToken);
      return data.accessToken;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

async function ensureAccessToken(): Promise<string | null> {
  const token = readAccessToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  const expiresAtMs = payload?.exp ? payload.exp * 1000 : 0;
  if (expiresAtMs > Date.now() + 30_000) return token;
  return refreshAccessToken();
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
    const token = await ensureAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (options.auth && res.status === 401 && readRefreshToken()) {
    const token = await refreshAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
      res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    }
  }

  const data = (await res.json().catch(() => ({}))) as ApiErrorBody & T;
  if (!res.ok) {
    if (options.auth && res.status === 401) {
      clearBusinessSession();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/business/login")) {
        window.location.assign("/business/login");
      }
      throw new BusinessSessionExpiredError();
    }
    throw new Error(extractMessage(data, `Request failed (${res.status})`));
  }
  return data as T;
}

export function registerBusiness(input: {
  fullName: string;
  password: string;
  email?: string;
  phone?: string;
  companyName: string;
  industry?: string;
  companyEmail?: string;
  companyPhone?: string;
}) {
  return requestJson<{ user: BusinessUser; tokens: { accessToken: string; refreshToken: string } }>(
    "/auth/register/business",
    { method: "POST", body: JSON.stringify(input) },
  );
}

export function loginBusiness(identifier: string, password: string) {
  return requestJson<{ user: BusinessUser; tokens: { accessToken: string; refreshToken: string } }>(
    "/auth/login",
    { method: "POST", body: JSON.stringify({ identifier, password }) },
  );
}

export function persistBusinessSession(data: {
  user: BusinessUser;
  tokens: { accessToken: string; refreshToken: string };
}) {
  localStorage.setItem("fastpay_business_token", data.tokens.accessToken);
  localStorage.setItem("fastpay_business_refresh", data.tokens.refreshToken);
  localStorage.setItem("fastpay_business_user", JSON.stringify(data.user));
}

export function getBusinessUser(): BusinessUser | null {
  const raw = localStorage.getItem("fastpay_business_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BusinessUser;
  } catch {
    return null;
  }
}

export function clearBusinessSession() {
  localStorage.removeItem("fastpay_business_token");
  localStorage.removeItem("fastpay_business_refresh");
  localStorage.removeItem("fastpay_business_user");
}

export function fetchBusinessOrg() {
  return requestJson<BusinessOrg | null>("/business/orgs/me", { auth: true });
}

export function updateBusinessOrg(input: Partial<BusinessOrg>) {
  return requestJson<BusinessOrg>("/business/orgs/me", {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(input),
  });
}

export function fetchBusinessDashboard() {
  return requestJson<{
    org: BusinessOrg;
    branchCount: number;
    activeBranches: number;
    memberCount: number;
    totalReceivedRwf: number;
    branches: BusinessBranch[];
  }>("/business/dashboard", { auth: true });
}

export function fetchBranches() {
  return requestJson<BusinessBranch[]>("/business/branches", { auth: true });
}

export function linkBranch(merchantCode: string) {
  return requestJson<BusinessBranch>("/business/branches/link", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ merchantCode }),
  });
}

export function createBranch(input: {
  branchName: string;
  category?: string;
  businessEmail?: string;
  businessPhone?: string;
}) {
  return requestJson<{ orgId: string; merchantCode: string; businessName: string }>(
    "/business/branches",
    { method: "POST", auth: true, body: JSON.stringify(input) },
  );
}

export function fetchBusinessMembers() {
  return requestJson<BusinessMember[]>("/business/members", { auth: true });
}

export function addBusinessMember(input: {
  fullName: string;
  email?: string;
  role?: BusinessMember["role"];
}) {
  return requestJson<BusinessMember>("/business/members", {
    method: "POST",
    auth: true,
    body: JSON.stringify(input),
  });
}

export function formatRwf(amount: number) {
  return `RWF ${amount.toLocaleString("en-US")}`;
}

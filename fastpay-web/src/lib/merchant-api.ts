const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type MerchantUser = {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  accountType: "consumer" | "merchant";
  merchantOrgId?: string;
  merchantCode?: string;
  businessName?: string;
};

export type MerchantOrg = {
  orgId: string;
  merchantCode: string;
  businessName: string;
  category?: string;
  businessEmail?: string;
  businessPhone?: string;
  address?: string;
  status: string;
  totalReceivedRwf: number;
  createdAt?: string;
};

export type MerchantInvoice = {
  id: string;
  invoiceNumber: string;
  merchantCode: string;
  amountRwf: number;
  description?: string;
  status: string;
  expiresAt?: string;
  paidAt?: string;
  createdAt?: string;
};

export type MerchantTransaction = {
  id: string;
  amountRwf: number;
  channel: string;
  merchantCode?: string;
  paymentRef?: string;
  txHash?: string;
  beneficiaryLabel?: string;
  status: string;
  createdAt?: string;
};

type ApiErrorBody = { message?: string | string[]; error?: string };

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
    const token = localStorage.getItem("fastpay_merchant_token") ?? localStorage.getItem("fastpay_access_token");
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = (await res.json().catch(() => ({}))) as ApiErrorBody & T;
  if (!res.ok) throw new Error(extractMessage(data, `Request failed (${res.status})`));
  return data as T;
}

export function registerMerchant(input: {
  fullName: string;
  password: string;
  email?: string;
  phone?: string;
  businessName: string;
  category?: string;
}) {
  return requestJson<{ user: MerchantUser; tokens: { accessToken: string; refreshToken: string } }>(
    "/auth/register/merchant",
    { method: "POST", body: JSON.stringify(input) },
  );
}

export function loginMerchant(identifier: string, password: string) {
  return requestJson<{ user: MerchantUser; tokens: { accessToken: string; refreshToken: string } }>(
    "/auth/login",
    { method: "POST", body: JSON.stringify({ identifier, password }) },
  );
}

export function persistMerchantSession(data: {
  user: MerchantUser;
  tokens: { accessToken: string; refreshToken: string };
}) {
  localStorage.setItem("fastpay_merchant_token", data.tokens.accessToken);
  localStorage.setItem("fastpay_merchant_refresh", data.tokens.refreshToken);
  localStorage.setItem("fastpay_merchant_user", JSON.stringify(data.user));
}

export function getMerchantUser(): MerchantUser | null {
  const raw = localStorage.getItem("fastpay_merchant_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MerchantUser;
  } catch {
    return null;
  }
}

export function clearMerchantSession() {
  localStorage.removeItem("fastpay_merchant_token");
  localStorage.removeItem("fastpay_merchant_refresh");
  localStorage.removeItem("fastpay_merchant_user");
}

export function fetchMerchantOrg() {
  return requestJson<MerchantOrg | null>("/merchant/orgs/me", { auth: true });
}

export function fetchMerchantDashboard() {
  return requestJson<{
    org: MerchantOrg;
    todayTotalRwf: number;
    todayCount: number;
    openInvoices: number;
    totalReceivedRwf: number;
    recentTransactions: Array<{ id: string; amountRwf: number; channel: string; createdAt?: string }>;
  }>("/merchant/dashboard", { auth: true });
}

export function fetchMerchantInvoices() {
  return requestJson<MerchantInvoice[]>("/merchant/invoices", { auth: true });
}

export function createMerchantInvoice(input: { amountRwf: number; description?: string }) {
  return requestJson<MerchantInvoice>("/merchant/invoices", {
    method: "POST",
    auth: true,
    body: JSON.stringify(input),
  });
}

export function fetchMerchantTransactions() {
  return requestJson<MerchantTransaction[]>("/merchant/transactions", { auth: true });
}

export function updateMerchantOrg(input: Partial<MerchantOrg>) {
  return requestJson<MerchantOrg>("/merchant/orgs/me", {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(input),
  });
}

export function formatRwf(amount: number) {
  return `RWF ${amount.toLocaleString("en-US")}`;
}

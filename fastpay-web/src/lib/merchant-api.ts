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

export class MerchantSessionExpiredError extends Error {
  constructor() {
    super("Session expired. Please sign in again.");
    this.name = "MerchantSessionExpiredError";
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

function readMerchantAccessToken() {
  return (
    localStorage.getItem("fastpay_merchant_token") ??
    localStorage.getItem("fastpay_access_token")
  );
}

function readMerchantRefreshToken() {
  return (
    localStorage.getItem("fastpay_merchant_refresh") ??
    localStorage.getItem("fastpay_refresh_token")
  );
}

let merchantRefreshInFlight: Promise<string | null> | null = null;

async function refreshMerchantAccessToken(): Promise<string | null> {
  if (merchantRefreshInFlight) return merchantRefreshInFlight;

  merchantRefreshInFlight = (async () => {
    const refreshToken = readMerchantRefreshToken();
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
      } & ApiErrorBody;
      if (!res.ok || !data.accessToken || !data.refreshToken) return null;

      localStorage.setItem("fastpay_merchant_token", data.accessToken);
      localStorage.setItem("fastpay_merchant_refresh", data.refreshToken);
      return data.accessToken;
    } catch {
      return null;
    } finally {
      merchantRefreshInFlight = null;
    }
  })();

  return merchantRefreshInFlight;
}

async function ensureMerchantAccessToken(): Promise<string | null> {
  const token = readMerchantAccessToken();
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  const expiresAtMs = payload?.exp ? payload.exp * 1000 : 0;
  if (expiresAtMs > Date.now() + 30_000) return token;
  return refreshMerchantAccessToken();
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
    const token = await ensureMerchantAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (options.auth && res.status === 401 && readMerchantRefreshToken()) {
    const token = await refreshMerchantAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
      res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    }
  }

  const data = (await res.json().catch(() => ({}))) as ApiErrorBody & T;
  if (!res.ok) {
    if (options.auth && res.status === 401) {
      clearMerchantSession();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/merchant/login")) {
        window.location.assign("/merchant/login");
      }
      throw new MerchantSessionExpiredError();
    }
    throw new Error(extractMessage(data, `Request failed (${res.status})`));
  }
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

export type MerchantProduct = {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  description?: string;
  unit: string;
  stockQty: number;
  reorderLevel: number;
  costPriceRwf: number;
  sellPriceRwf: number;
  status: "active" | "out_of_stock" | "archived";
  lowStock: boolean;
  createdAt?: string;
};

export type MerchantStockMovement = {
  id: string;
  productId: string;
  productName?: string;
  type: "stock_in" | "sale" | "adjustment" | "return" | "write_off";
  quantityDelta: number;
  quantityAfter: number;
  note?: string;
  createdAt?: string;
};

export type MerchantEmployee = {
  id: string;
  fullName: string;
  phone?: string;
  email?: string;
  role: "manager" | "cashier" | "stock_keeper" | "staff";
  status: "active" | "on_leave" | "terminated";
  salaryRwf: number;
  payCycle: "weekly" | "biweekly" | "monthly";
  hiredAt?: string;
  notes?: string;
  createdAt?: string;
};

export type MerchantPayrollEntry = {
  id: string;
  employeeId: string;
  employeeName: string;
  amountRwf: number;
  periodStart: string;
  periodEnd: string;
  status: "pending" | "paid" | "cancelled";
  paidAt?: string;
  note?: string;
  createdAt?: string;
};

export type MerchantGoal = {
  id: string;
  title: string;
  description?: string;
  horizon: "short" | "long";
  kind: "revenue" | "sales_count" | "stock_level" | "custom";
  targetValue: number;
  currentValue: number;
  progressPct: number;
  deadline?: string;
  status: "active" | "completed" | "cancelled";
  createdAt?: string;
};

export function fetchInventorySummary() {
  return requestJson<{
    skuCount: number;
    outOfStock: number;
    lowStock: number;
    stockValueRwf: number;
  }>("/merchant/inventory/summary", { auth: true });
}

export function fetchProducts() {
  return requestJson<MerchantProduct[]>("/merchant/products", { auth: true });
}

export function createProduct(input: {
  name: string;
  sku?: string;
  category?: string;
  description?: string;
  unit?: string;
  stockQty?: number;
  reorderLevel?: number;
  costPriceRwf?: number;
  sellPriceRwf?: number;
}) {
  return requestJson<MerchantProduct>("/merchant/products", {
    method: "POST",
    auth: true,
    body: JSON.stringify(input),
  });
}

export function recordStockMovement(input: {
  productId: string;
  type: MerchantStockMovement["type"];
  quantity: number;
  note?: string;
}) {
  return requestJson<{ product: MerchantProduct; movement: MerchantStockMovement }>(
    "/merchant/stock-movements",
    { method: "POST", auth: true, body: JSON.stringify(input) },
  );
}

export function fetchStockMovements(productId?: string) {
  const q = productId ? `?productId=${encodeURIComponent(productId)}` : "";
  return requestJson<MerchantStockMovement[]>(`/merchant/stock-movements${q}`, { auth: true });
}

export function fetchHrSummary() {
  return requestJson<{
    activeEmployees: number;
    monthlySalaryCommitRwf: number;
    pendingPayrollEntries: number;
  }>("/merchant/hr/summary", { auth: true });
}

export function fetchEmployees() {
  return requestJson<MerchantEmployee[]>("/merchant/employees", { auth: true });
}

export function createEmployee(input: {
  fullName: string;
  phone?: string;
  email?: string;
  role?: MerchantEmployee["role"];
  salaryRwf?: number;
  payCycle?: MerchantEmployee["payCycle"];
  hiredAt?: string;
  notes?: string;
}) {
  return requestJson<MerchantEmployee>("/merchant/employees", {
    method: "POST",
    auth: true,
    body: JSON.stringify(input),
  });
}

export function updateEmployee(
  id: string,
  input: Partial<Pick<MerchantEmployee, "fullName" | "phone" | "email" | "role" | "status" | "salaryRwf" | "payCycle" | "notes">>,
) {
  return requestJson<MerchantEmployee>(`/merchant/employees/${id}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(input),
  });
}

export function fetchPayroll() {
  return requestJson<MerchantPayrollEntry[]>("/merchant/payroll", { auth: true });
}

export function createPayrollEntry(input: {
  employeeId: string;
  amountRwf?: number;
  periodStart: string;
  periodEnd: string;
  note?: string;
  markPaid?: boolean;
}) {
  return requestJson<MerchantPayrollEntry>("/merchant/payroll", {
    method: "POST",
    auth: true,
    body: JSON.stringify(input),
  });
}

export function markPayrollPaid(id: string) {
  return requestJson<MerchantPayrollEntry>(`/merchant/payroll/${id}/pay`, {
    method: "POST",
    auth: true,
  });
}

export function fetchGoals() {
  return requestJson<MerchantGoal[]>("/merchant/goals", { auth: true });
}

export function createGoal(input: {
  title: string;
  description?: string;
  horizon?: MerchantGoal["horizon"];
  kind?: MerchantGoal["kind"];
  targetValue: number;
  currentValue?: number;
  deadline?: string;
}) {
  return requestJson<MerchantGoal>("/merchant/goals", {
    method: "POST",
    auth: true,
    body: JSON.stringify(input),
  });
}

export function bumpGoalProgress(id: string, amount: number) {
  return requestJson<MerchantGoal>(`/merchant/goals/${id}/progress`, {
    method: "POST",
    auth: true,
    body: JSON.stringify({ amount }),
  });
}

export function updateGoal(
  id: string,
  input: Partial<Pick<MerchantGoal, "title" | "description" | "horizon" | "kind" | "targetValue" | "currentValue" | "deadline" | "status">>,
) {
  return requestJson<MerchantGoal>(`/merchant/goals/${id}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(input),
  });
}

export function formatRwf(amount: number) {
  return `RWF ${amount.toLocaleString("en-US")}`;
}

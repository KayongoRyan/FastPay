const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export type FamilyRole = "parent" | "child" | "guardian";

export type FamilySummary = {
  id: string;
  name: string;
  role: FamilyRole;
  walletAddress?: string;
};

export type FamilyMemberView = {
  id: string;
  userId: string;
  name: string;
  role: FamilyRole;
  spendingLimitDaily?: number;
  spendingLimitMonthly: number;
  requiresApprovalAbove?: number;
  spentMonth: number;
  spentToday: number;
  joinedAt?: string;
};

export type FamilyDashboard = {
  id: string;
  name: string;
  walletAddress?: string;
  myRole: FamilyRole;
  poolLimit: number;
  poolUsed: number;
  pendingApprovals: number;
  members: FamilyMemberView[];
  createdAt?: string;
};

export type FamilyInvite = {
  id: string;
  token: string;
  inviteeName: string;
  role: FamilyRole;
  status: string;
  expiresAt: string;
};

export type PendingInvite = {
  id: string;
  familyId: string;
  token: string;
  role: FamilyRole;
  expiresAt: string;
};

export type SavingsGoal = {
  id: string;
  familyId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  token: string;
  deadline?: string;
  status: string;
  progressPct: number;
};

export type ApprovalRequest = {
  id: string;
  familyId: string;
  requesterId: string;
  requesterName?: string;
  approverId?: string;
  transactionData: {
    destination?: string;
    amountRwf?: number;
    memo?: string;
    description?: string;
  };
  status: string;
  expiresAt?: string;
  resolvedAt?: string;
  createdAt?: string;
};

type ApiErrorBody = { message?: string | string[]; error?: string };

function extractMessage(body: ApiErrorBody, fallback: string) {
  if (Array.isArray(body.message)) return body.message.join(". ");
  if (typeof body.message === "string") return body.message;
  if (body.error) return body.error;
  return fallback;
}

function readAccessToken() {
  return localStorage.getItem("fastpay_access_token");
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
  if (options.auth !== false) {
    const token = readAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error(
      "Cannot reach FastPay API. Start the gateway and family service, then retry.",
    );
  }

  const data = (await res.json().catch(() => ({}))) as ApiErrorBody & T;

  if (!res.ok) {
    throw new Error(extractMessage(data, `Request failed (${res.status})`));
  }

  return data as T;
}

export function listFamilies() {
  return requestJson<FamilySummary[]>("/family");
}

export function createFamily(name: string) {
  return requestJson<FamilyDashboard>("/family", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function getFamilyDashboard(familyId: string) {
  return requestJson<FamilyDashboard>(`/family/${familyId}`);
}

export function inviteFamilyMember(
  familyId: string,
  identifier: string,
  role: FamilyRole = "child",
) {
  return requestJson<FamilyInvite>(`/family/${familyId}/invites`, {
    method: "POST",
    body: JSON.stringify({ identifier, role }),
  });
}

export function listPendingInvites() {
  return requestJson<PendingInvite[]>("/family/invites/pending");
}

export function acceptFamilyInvite(token: string) {
  return requestJson<{ familyId: string; role: FamilyRole; status: string }>(
    `/family/invites/${token}/accept`,
    { method: "POST" },
  );
}

export function listFamilyGoals(familyId: string) {
  return requestJson<SavingsGoal[]>(`/family/${familyId}/goals`);
}

export function createFamilyGoal(
  familyId: string,
  input: { name: string; targetAmount: number; deadline?: string },
) {
  return requestJson<SavingsGoal>(`/family/${familyId}/goals`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listFamilyApprovals(familyId: string, status?: string) {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  return requestJson<ApprovalRequest[]>(`/family/${familyId}/approvals${q}`);
}

export function resolveFamilyApproval(
  familyId: string,
  requestId: string,
  status: "approved" | "rejected",
) {
  return requestJson<ApprovalRequest>(`/family/${familyId}/approvals/${requestId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function roleLabel(role: FamilyRole) {
  if (role === "parent") return "Owner";
  if (role === "guardian") return "Adult";
  return "Teen";
}

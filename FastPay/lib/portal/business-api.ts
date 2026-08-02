import { portalLogin, portalRequest } from "./client";
import { clearPortalSession, loadPortalUser, savePortalSession } from "./storage";
import type { PortalSession, PortalUser } from "./types";
import type { BusinessType } from "./business-types";

export type BusinessOrg = {
  orgId: string;
  businessCode: string;
  companyName: string;
  businessType?: string;
  industry?: string;
  companyEmail?: string;
  companyPhone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  registrationNumber?: string;
  website?: string;
  description?: string;
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

export type BusinessDashboard = {
  org: BusinessOrg;
  branchCount: number;
  activeBranches: number;
  memberCount: number;
  totalReceivedRwf: number;
  branches: BusinessBranch[];
};

export async function loginBusiness(identifier: string, password: string) {
  const session = await portalLogin("business", identifier, password);
  if (session.user.accountType !== "business") {
    throw new Error("This account is not a business HQ login. Use merchant or personal sign-in.");
  }
  await savePortalSession("business", session.user, session.tokens);
  return session;
}

export async function registerBusiness(input: {
  fullName: string;
  password: string;
  email?: string;
  phone?: string;
  companyName: string;
  businessType: BusinessType;
  industry?: string;
  companyEmail?: string;
  companyPhone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  registrationNumber?: string;
  website?: string;
  description?: string;
}): Promise<PortalSession> {
  const session = await portalRequest<PortalSession>("business", "/auth/register/business", {
    method: "POST",
    body: JSON.stringify(input),
  });
  await savePortalSession("business", session.user, session.tokens);
  return session;
}

export async function logoutBusiness() {
  try {
    await portalRequest("business", "/auth/logout", { method: "POST", auth: true, body: "{}" });
  } catch {
    // clear local anyway
  }
  await clearPortalSession("business");
}

export function getCachedBusinessUser() {
  return loadPortalUser("business");
}

export function fetchBusinessDashboard() {
  return portalRequest<BusinessDashboard>("business", "/business/dashboard", { auth: true });
}

export function fetchBusinessOrg() {
  return portalRequest<BusinessOrg | null>("business", "/business/orgs/me", { auth: true });
}

export function updateBusinessOrg(input: Partial<BusinessOrg>) {
  return portalRequest<BusinessOrg>("business", "/business/orgs/me", {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(input),
  });
}

export function fetchBranches() {
  return portalRequest<BusinessBranch[]>("business", "/business/branches", { auth: true });
}

export function createBranch(input: {
  branchName: string;
  category?: BusinessType;
  businessEmail?: string;
  businessPhone?: string;
}) {
  return portalRequest<{ orgId: string; merchantCode: string; businessName: string }>(
    "business",
    "/business/branches",
    { method: "POST", auth: true, body: JSON.stringify(input) },
  );
}

export function linkBranch(merchantCode: string) {
  return portalRequest<BusinessBranch>("business", "/business/branches/link", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ merchantCode }),
  });
}

export type { PortalUser };

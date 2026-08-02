import { portalLogin, portalRequest } from "./client";
import { clearPortalSession, loadPortalUser, savePortalSession } from "./storage";
import type { PortalSession, PortalUser } from "./types";
import type { BusinessType } from "./business-types";

export type MerchantOrg = {
  orgId: string;
  merchantCode: string;
  businessName: string;
  category?: string;
  businessEmail?: string;
  businessPhone?: string;
  address?: string;
  city?: string;
  taxId?: string;
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

export type MerchantDashboard = {
  org: MerchantOrg;
  todayTotalRwf: number;
  todayCount: number;
  openInvoices: number;
  totalReceivedRwf: number;
  recentTransactions: Array<{
    id: string;
    amountRwf: number;
    channel: string;
    createdAt?: string;
  }>;
};

export async function loginMerchant(identifier: string, password: string) {
  const session = await portalLogin("merchant", identifier, password);
  if (session.user.accountType !== "merchant") {
    throw new Error("This account is not a merchant login. Use personal or business sign-in.");
  }
  await savePortalSession("merchant", session.user, session.tokens);
  return session;
}

export async function registerMerchant(input: {
  fullName: string;
  password: string;
  email?: string;
  phone?: string;
  businessName: string;
  category: BusinessType;
  businessEmail?: string;
  businessPhone?: string;
  address?: string;
  city?: string;
  taxId?: string;
}): Promise<PortalSession> {
  const session = await portalRequest<PortalSession>("merchant", "/auth/register/merchant", {
    method: "POST",
    body: JSON.stringify(input),
  });
  await savePortalSession("merchant", session.user, session.tokens);
  return session;
}

export async function logoutMerchant() {
  try {
    await portalRequest("merchant", "/auth/logout", { method: "POST", auth: true, body: "{}" });
  } catch {
    // clear local anyway
  }
  await clearPortalSession("merchant");
}

export function getCachedMerchantUser() {
  return loadPortalUser("merchant");
}

export function fetchMerchantDashboard() {
  return portalRequest<MerchantDashboard>("merchant", "/merchant/dashboard", { auth: true });
}

export function fetchMerchantOrg() {
  return portalRequest<MerchantOrg | null>("merchant", "/merchant/orgs/me", { auth: true });
}

export function updateMerchantOrg(input: Partial<MerchantOrg>) {
  return portalRequest<MerchantOrg>("merchant", "/merchant/orgs/me", {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(input),
  });
}

export function fetchMerchantInvoices() {
  return portalRequest<MerchantInvoice[]>("merchant", "/merchant/invoices", { auth: true });
}

export function createMerchantInvoice(input: { amountRwf: number; description?: string }) {
  return portalRequest<MerchantInvoice>("merchant", "/merchant/invoices", {
    method: "POST",
    auth: true,
    body: JSON.stringify(input),
  });
}

export type MerchantEscrow = {
  id: string;
  escrowCode: string;
  amountRwf: number;
  status: string;
  title?: string;
  description?: string;
  sellerMerchantCode?: string;
  sellerBusinessName?: string;
  shippingNote?: string;
  disputeReason?: string;
  createdAt?: string;
  fundedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  releasedAt?: string;
};

export function listMerchantEscrows() {
  return portalRequest<MerchantEscrow[]>("merchant", "/escrow/merchant", { auth: true });
}

export function shipMerchantEscrow(id: string, shippingNote?: string) {
  return portalRequest<MerchantEscrow>("merchant", `/escrow/${id}/ship`, {
    method: "POST",
    auth: true,
    body: JSON.stringify({ shippingNote }),
  });
}

export function deliverMerchantEscrow(id: string) {
  return portalRequest<MerchantEscrow>("merchant", `/escrow/${id}/deliver`, {
    method: "POST",
    auth: true,
    body: "{}",
  });
}

export function disputeMerchantEscrow(id: string, reason: string) {
  return portalRequest<MerchantEscrow>("merchant", `/escrow/${id}/dispute`, {
    method: "POST",
    auth: true,
    body: JSON.stringify({ reason }),
  });
}

export type { PortalUser };

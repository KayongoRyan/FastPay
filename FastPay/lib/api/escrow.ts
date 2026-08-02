import { apiGetAuth, apiPostAuth } from "@/lib/api/client";

export type EscrowStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "released"
  | "disputed"
  | "cancelled"
  | "refunded";

export type EscrowContract = {
  id: string;
  escrowCode: string;
  buyerUserId: string;
  sellerMerchantOrgId: string;
  sellerMerchantCode?: string;
  sellerBusinessName?: string;
  amountRwf: number;
  currency: string;
  status: EscrowStatus;
  title?: string;
  description?: string;
  releaseRules: {
    requiresBuyerConfirm: boolean;
    autoReleaseHoursAfterDelivery?: number;
    autoReleaseAt?: string;
  };
  orderId?: string;
  fundedAt?: string;
  fundedPaymentRef?: string;
  shippedAt?: string;
  shippingNote?: string;
  deliveredAt?: string;
  releasedAt?: string;
  releasePaymentRef?: string;
  disputedAt?: string;
  disputeReason?: string;
  isActive: boolean;
  createdAt?: string;
};

export function formatEscrowRwf(amount: number) {
  return `RWF ${amount.toLocaleString("en-US")}`;
}

export const ESCROW_STATUS_LABEL: Record<EscrowStatus, string> = {
  pending: "Pending",
  paid: "Paid (held)",
  shipped: "Shipped",
  delivered: "Delivered",
  released: "Released",
  disputed: "Disputed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export function listMyEscrows() {
  return apiGetAuth<EscrowContract[]>("/escrow");
}

export function getEscrow(id: string) {
  return apiGetAuth<EscrowContract>(`/escrow/${id}`);
}

export function createEscrow(input: {
  merchantCode: string;
  amountRwf: number;
  title?: string;
  description?: string;
  requiresBuyerConfirm?: boolean;
  autoReleaseHoursAfterDelivery?: number;
}) {
  return apiPostAuth<EscrowContract>("/escrow", input);
}

export function fundEscrow(id: string, paymentRef?: string) {
  return apiPostAuth<EscrowContract>(`/escrow/${id}/fund`, { paymentRef });
}

export function confirmEscrow(id: string) {
  return apiPostAuth<EscrowContract>(`/escrow/${id}/confirm`, {});
}

export function deliverEscrow(id: string) {
  return apiPostAuth<EscrowContract>(`/escrow/${id}/deliver`, {});
}

export function disputeEscrow(id: string, reason: string) {
  return apiPostAuth<EscrowContract>(`/escrow/${id}/dispute`, { reason });
}

export function cancelEscrow(id: string) {
  return apiPostAuth<EscrowContract>(`/escrow/${id}/cancel`, {});
}

import { apiGet, apiPostAuth } from "./client";

export type MomoProvider = "mtn" | "airtel";
export type MomoPaymentStatus = "pending" | "processing" | "completed" | "failed";

export interface InitiateMomoPaymentRequest {
  provider: MomoProvider;
  phone: string;
  amountRwf: number;
  walletPublicKey: string;
}

export interface InitiateMomoPaymentResponse {
  paymentId: string;
  status: MomoPaymentStatus;
  message: string;
}

export interface MomoPaymentStatusResponse {
  paymentId: string;
  provider: MomoProvider;
  phone: string;
  amountRwf: number;
  status: MomoPaymentStatus;
  usdtCredited?: number;
  message?: string;
}

export async function initiateMomoPayment(
  payload: InitiateMomoPaymentRequest,
): Promise<InitiateMomoPaymentResponse> {
  return apiPostAuth<InitiateMomoPaymentResponse>("/momo/initiate", payload);
}

export async function getMomoPaymentStatus(
  paymentId: string,
): Promise<MomoPaymentStatusResponse> {
  return apiGet<MomoPaymentStatusResponse>(
    `/momo/${encodeURIComponent(paymentId)}/status`,
  );
}

import { apiGetAuth, apiPostAuth } from "./client";

export type KycDocumentType = "id_card" | "proof_of_address";
export type IdSubtype = "national_id" | "passport" | "drivers_license";
export type PoaType =
  | "utility_bill"
  | "bank_statement"
  | "lease_agreement"
  | "tax_notice";

export interface UploadKycDocumentRequest {
  documentType: KycDocumentType;
  fileName: string;
  contentBase64: string;
  idSubtype?: IdSubtype;
  poaType?: PoaType;
  holderName?: string;
  issueDate?: string;
}

export interface UploadKycDocumentResponse {
  documentId: string;
  verificationStatus: "approved" | "rejected" | "pending";
  confidenceScore?: number;
  rejectionReason?: string;
}

export interface KycStatusResponse {
  kycStatus: string;
  kycLevel: number;
  documents: Array<{
    documentType: string;
    idSubtype?: string;
    poaType?: string;
    verificationStatus: string;
    confidenceScore?: number;
    rejectionReason?: string;
    uploadedAt: string;
  }>;
}

export async function uploadKycDocument(
  payload: UploadKycDocumentRequest,
): Promise<UploadKycDocumentResponse> {
  return apiPostAuth("/kyc/documents", payload);
}

export async function fetchKycStatus(): Promise<KycStatusResponse> {
  return apiGetAuth("/kyc/status");
}

import { apiGetAuth, apiPostAuth } from "./client";

export type KycDocumentType = "id_card" | "proof_of_address";

export interface UploadKycDocumentRequest {
  documentType: KycDocumentType;
  fileName: string;
  contentBase64: string;
}

export interface KycStatusResponse {
  kycStatus: string;
  kycLevel: number;
  documents: Array<{
    documentType: string;
    verificationStatus: string;
    uploadedAt: string;
  }>;
}

export async function uploadKycDocument(
  payload: UploadKycDocumentRequest,
): Promise<{ documentId: string; verificationStatus: string }> {
  return apiPostAuth("/kyc/documents", payload);
}

export async function fetchKycStatus(): Promise<KycStatusResponse> {
  return apiGetAuth("/kyc/status");
}

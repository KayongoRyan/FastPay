export type IdSubtype = "national_id" | "passport" | "drivers_license";

export type PoaType =
  | "utility_bill"
  | "bank_statement"
  | "lease_agreement"
  | "tax_notice";

export const ID_TYPE_OPTIONS: Array<{
  id: IdSubtype;
  label: string;
  hint: string;
}> = [
  {
    id: "national_id",
    label: "National ID",
    hint: "Government-issued ID card",
  },
  {
    id: "passport",
    label: "Passport",
    hint: "Photo page with your name visible",
  },
  {
    id: "drivers_license",
    label: "Driver's License",
    hint: "Front side with photo and name",
  },
];

export const POA_TYPE_OPTIONS: Array<{
  id: PoaType;
  label: string;
  hint: string;
}> = [
  {
    id: "utility_bill",
    label: "Utility Bill",
    hint: "Water, electricity, or internet bill",
  },
  {
    id: "bank_statement",
    label: "Bank Statement",
    hint: "Statement showing your address",
  },
  {
    id: "lease_agreement",
    label: "Lease Agreement",
    hint: "Signed rental or lease contract",
  },
  {
    id: "tax_notice",
    label: "Tax Notice",
    hint: "Recent tax or municipal document",
  },
];

export type KycStep =
  | "select_id_type"
  | "scan_id"
  | "scan_poa"
  | "review";

export interface CapturedDocument {
  uri: string;
  fileName: string;
  contentBase64: string;
  byteLength: number;
}

export interface VerificationResult {
  verificationStatus: "approved" | "rejected" | "pending";
  confidenceScore?: number;
  rejectionReason?: string;
}

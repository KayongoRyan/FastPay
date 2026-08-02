import { apiGetAuth, apiPostAuth } from "@/lib/api/client";

export type InsuranceRiskScores = {
  deviceReputation: number;
  transactionHistory: number;
  kycScore: number;
  securityScore: number;
  fraudDetection: number;
  overall: number;
};

export type InsurancePolicy = {
  id: string;
  policyNumber: string;
  status: string;
  premiumRwf: number;
  coverageLimitRwf: number;
  riskScores: InsuranceRiskScores;
  issuedAt?: string;
  nextBillingAt?: string;
};

export type InsuranceClaim = {
  id: string;
  claimNumber: string;
  amountRwf: number;
  status: string;
  reason: string;
  drainTxRef?: string;
  evidenceNote?: string;
  fraudRiskScore?: number;
  submittedAt?: string;
  investigationStartedAt?: string;
  reviewedAt?: string;
  paidAt?: string;
  payoutRef?: string;
  process: string[];
};

export type InsuranceDashboard = {
  modules: string[];
  insuranceFlow: string[];
  claimProcess: string[];
  riskEngine: string[];
  policy: InsurancePolicy | null;
  claims: InsuranceClaim[];
};

export type InsuranceQuote = {
  coverageLimitRwf: number;
  premiumRwf: number;
  riskScores: InsuranceRiskScores;
  flow: string[];
};

export function formatInsRwf(amount: number) {
  return `RWF ${amount.toLocaleString("en-US")}`;
}

export function fetchInsuranceDashboard() {
  return apiGetAuth<InsuranceDashboard>("/insurance/dashboard");
}

export function fetchInsuranceQuote(coverageLimitRwf?: number) {
  const q =
    coverageLimitRwf != null ? `?coverageLimitRwf=${coverageLimitRwf}` : "";
  return apiGetAuth<InsuranceQuote>(`/insurance/quote${q}`);
}

export function enableInsurance(desiredCoverageLimitRwf?: number) {
  return apiPostAuth<InsurancePolicy>("/insurance/enable", {
    desiredCoverageLimitRwf,
  });
}

export function fetchMyPolicy() {
  return apiGetAuth<InsurancePolicy | null>("/insurance/me");
}

export function cancelInsurance() {
  return apiPostAuth<InsurancePolicy>("/insurance/cancel", {});
}

export function submitClaim(input: {
  amountRwf: number;
  reason: string;
  drainTxRef?: string;
  evidenceNote?: string;
}) {
  return apiPostAuth<InsuranceClaim>("/insurance/claims", input);
}

export function listClaims() {
  return apiGetAuth<InsuranceClaim[]>("/insurance/claims");
}

export function getClaim(id: string) {
  return apiGetAuth<InsuranceClaim>(`/insurance/claims/${id}`);
}

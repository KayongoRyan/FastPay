import type { Href } from "expo-router";

import type { AnalyticsMode } from "@/components/analytics";
import type { BillCategoryId } from "@/lib/bills/types";
import type { MobileMoneyProviderId } from "@/lib/buy/mobile-money";

export type LoanType = "personal" | "business" | "salary";
export type InsurancePlanType = "health" | "motor" | "device";
export type IremboServiceId =
  | "national-id"
  | "birth-certificate"
  | "police-clearance"
  | "land-title"
  | "driving-license";

function withQuery(path: string, query: Record<string, string | undefined>): Href {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) {
      params.set(key, value);
    }
  }
  const qs = params.toString();
  return (qs ? `${path}?${qs}` : path) as Href;
}

export const featureRoutes = {
  bankPay: "/bank-pay" as Href,
  walletTransfer: "/wallet/transfer" as Href,
  walletReceive: "/wallet/receive" as Href,
  wallet: "/wallet" as Href,
  convert: "/convert" as Href,
  kyc: "/(auth)/kyc" as Href,
  offlineReceive: "/offline/receive" as Href,
  settings: "/settings" as Href,

  buy: (provider?: MobileMoneyProviderId) =>
    withQuery("/buy", { provider }),

  bills: (opts?: { category?: BillCategoryId; add?: boolean }) =>
    withQuery("/bills", {
      category: opts?.category,
      add: opts?.add ? "1" : undefined,
    }),

  analytics: (mode?: AnalyticsMode) => withQuery("/analytics", { mode }),

  loanApply: (type?: LoanType) =>
    withQuery("/loan/apply", { type }),

  iremboService: (service?: IremboServiceId) =>
    withQuery("/irembo", { service }),

  insurancePlans: (plan?: InsurancePlanType) =>
    withQuery("/services/insurance-plans", { plan }),

  familySetup: "/services/family-setup" as Href,
  voucher: "/services/voucher" as Href,
  escrowTransfer: "/wallet/transfer" as Href,
  support: "/support" as Href,
};

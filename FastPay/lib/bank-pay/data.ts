import type {
  BankPayBeneficiary,
  BankPayFormValues,
  BankPayMerchant,
} from "./types";
import {
  buildFastPayAccountNumber,
  formatFastPayAccountNumberDisplay,
} from "@/lib/wallet/account-number";

export {
  buildFastPayAccountNumber,
  formatFastPayAccountNumberDisplay,
  FASTPAY_INSTITUTION_CODE,
} from "@/lib/wallet/account-number";

export const BENEFICIARIES: BankPayBeneficiary[] = [
  {
    id: "ben_1",
    name: "Rent — Kigali Heights",
    category: "Housing",
    fastPayCode: "FP-RNT-4821",
  },
  {
    id: "ben_2",
    name: "University Tuition",
    category: "Education",
    fastPayCode: "FP-EDU-9034",
  },
  {
    id: "ben_3",
    name: "Water & Electricity",
    category: "Utilities",
    fastPayCode: "FP-UTL-7712",
  },
  {
    id: "ben_4",
    name: "Health Insurance",
    category: "Insurance",
    fastPayCode: "FP-INS-5560",
  },
  {
    id: "ben_5",
    name: "Business Supplier",
    category: "Business",
    fastPayCode: "FP-BIZ-3389",
  },
];

const MERCHANTS: BankPayMerchant[] = [
  { code: "MRC001", name: "Kigali City Market" },
  { code: "MRC002", name: "Rwanda Revenue Authority" },
  { code: "MRC003", name: "REG Ltd" },
  { code: "MRC004", name: "BK Merchant Services" },
  { code: "MRC005", name: "IremboGov Payments" },
  { code: "MRC006", name: "MTN MoMo Merchant Hub" },
];

export function formatFastPayAccountNumber(
  userId: string,
  _publicKey?: string | null,
): string {
  return formatFastPayAccountNumberDisplay(buildFastPayAccountNumber(userId));
}

export function formatFastPayCode(publicKey?: string | null): string {
  if (!publicKey) {
    return "—";
  }
  const compact = publicKey.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  const core = compact.slice(-8).padStart(8, "0");
  return `FP-${core.slice(0, 4)}-${core.slice(4)}`;
}

export function getBeneficiaryById(
  id: string | null,
): BankPayBeneficiary | undefined {
  if (!id) {
    return undefined;
  }
  return BENEFICIARIES.find((item) => item.id === id);
}

export function lookupMerchant(code: string): BankPayMerchant | null {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return null;
  }

  const known = MERCHANTS.find((merchant) => merchant.code === normalized);
  if (known) {
    return known;
  }

  return {
    code: normalized,
    name: buildDemoMerchantName(normalized),
  };
}

const DEMO_PREFIXES = [
  "Kigali",
  "Rwanda",
  "FastPay",
  "Prime",
  "Golden",
  "Metro",
  "Sunrise",
  "Unity",
];

const DEMO_SUFFIXES = [
  "Store",
  "Shop",
  "Services",
  "Trading",
  "Mart",
  "Hub",
  "Retail",
  "Outlet",
];

function buildDemoMerchantName(code: string): string {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = (hash + code.charCodeAt(i) * (i + 1)) % 997;
  }
  const prefix = DEMO_PREFIXES[hash % DEMO_PREFIXES.length];
  const suffix = DEMO_SUFFIXES[(hash * 7) % DEMO_SUFFIXES.length];
  return `${prefix} ${suffix}`;
}

export function validateBankPayForm(values: BankPayFormValues): string | null {
  if (!values.beneficiaryId) {
    return "Select a beneficiary under Pay for.";
  }
  if (!values.merchantCode.trim()) {
    return "Enter a merchant code.";
  }
  const amount = Number(values.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return "Enter a valid payment amount.";
  }
  return null;
}

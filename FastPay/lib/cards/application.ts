import AsyncStorage from "@react-native-async-storage/async-storage";

import { fetchVerifiedMonthlyReceiveRwf } from "@/lib/cards/account-receive";
import {
  CARD_TIERS,
  formatRwf,
  PurchasableTierId,
  validateTierReceiveAmount,
} from "@/lib/cards/tiers";

export interface CardTierApplicationForm {
  tierId: PurchasableTierId;
  monthlyReceiveRwf: number;
  accountPhone: string;
  businessName: string;
}

export interface TierVerificationContext {
  userId: string;
  userPhone?: string;
}

export interface TierVerificationResult {
  approved: boolean;
  message: string;
  actualMonthlyReceiveRwf?: number;
}

export function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

export function validateApplicationForm(
  form: CardTierApplicationForm,
  context: TierVerificationContext,
): string | null {
  const amountError = validateTierReceiveAmount(
    form.tierId,
    form.monthlyReceiveRwf,
  );
  if (amountError) {
    return amountError;
  }

  const phone = normalizePhone(form.accountPhone);
  if (phone.length < 9) {
    return "Enter a valid account phone number.";
  }

  const accountPhone = normalizePhone(context.userPhone ?? "");
  if (accountPhone && phone !== accountPhone) {
    return "Phone number must match your FastPay account.";
  }

  if (form.businessName.trim().length < 2) {
    return "Enter your business or primary payment source.";
  }

  return null;
}

export async function verifyTierApplication(
  form: CardTierApplicationForm,
  context: TierVerificationContext,
): Promise<TierVerificationResult> {
  const formError = validateApplicationForm(form, context);
  if (formError) {
    return { approved: false, message: formError };
  }

  await new Promise((resolve) => setTimeout(resolve, 1200));

  const actualMonthlyReceiveRwf = await fetchVerifiedMonthlyReceiveRwf(
    context.userId,
  );
  const tier = CARD_TIERS[form.tierId];
  const min = tier.minMonthlyReceiveRwf;

  if (actualMonthlyReceiveRwf < min) {
    return {
      approved: false,
      actualMonthlyReceiveRwf,
      message: `We verified ${formatRwf(actualMonthlyReceiveRwf)} received last month. ${tier.label} requires at least ${formatRwf(min)}.`,
    };
  }

  if (form.monthlyReceiveRwf > actualMonthlyReceiveRwf) {
    return {
      approved: false,
      actualMonthlyReceiveRwf,
      message: `Declared amount exceeds verified receive of ${formatRwf(actualMonthlyReceiveRwf)}. Update your entry to match your account activity.`,
    };
  }

  return {
    approved: true,
    actualMonthlyReceiveRwf,
    message: `Verified. Your account received ${formatRwf(actualMonthlyReceiveRwf)} last month — you qualify for ${tier.label}.`,
  };
}

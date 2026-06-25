import { fetchVerifiedMonthlyReceiveRwf } from "@/lib/cards/account-receive";
import {
  CARD_TIERS,
  formatRwf,
  getBestMatchingTier,
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
  suggestedTierId?: PurchasableTierId | null;
  requestedTierId?: PurchasableTierId;
}

function buildIneligibleMessage(
  actualMonthlyReceiveRwf: number,
  requestedTierId: PurchasableTierId,
  suggestedTierId: PurchasableTierId | null,
): string {
  const requested = CARD_TIERS[requestedTierId];

  if (!suggestedTierId) {
    return `We verified ${formatRwf(actualMonthlyReceiveRwf)} received last month. ${requested.label} requires at least ${formatRwf(requested.minMonthlyReceiveRwf)}. Keep using your free FastPay card until your receive volume grows.`;
  }

  const suggested = CARD_TIERS[suggestedTierId];
  if (suggestedTierId === requestedTierId) {
    return `Declared amount exceeds verified receive of ${formatRwf(actualMonthlyReceiveRwf)}. Update your entry to match your account activity.`;
  }

  return `We verified ${formatRwf(actualMonthlyReceiveRwf)} received last month. ${requested.label} requires at least ${formatRwf(requested.minMonthlyReceiveRwf)}. Based on your receive volume, you qualify for ${suggested.label}.`;
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
  const suggestedTierId = getBestMatchingTier(actualMonthlyReceiveRwf);

  if (actualMonthlyReceiveRwf < min) {
    return {
      approved: false,
      actualMonthlyReceiveRwf,
      suggestedTierId,
      requestedTierId: form.tierId,
      message: buildIneligibleMessage(
        actualMonthlyReceiveRwf,
        form.tierId,
        suggestedTierId,
      ),
    };
  }

  if (form.monthlyReceiveRwf > actualMonthlyReceiveRwf) {
    return {
      approved: false,
      actualMonthlyReceiveRwf,
      suggestedTierId,
      requestedTierId: form.tierId,
      message: buildIneligibleMessage(
        actualMonthlyReceiveRwf,
        form.tierId,
        suggestedTierId,
      ),
    };
  }

  return {
    approved: true,
    actualMonthlyReceiveRwf,
    requestedTierId: form.tierId,
    message: `Verified. Your account received ${formatRwf(actualMonthlyReceiveRwf)} last month — you qualify for ${tier.label}.`,
  };
}

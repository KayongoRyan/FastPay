export type MobileMoneyProviderId = "mtn" | "airtel";

export interface MobileMoneyProvider {
  id: MobileMoneyProviderId;
  label: string;
  phoneLabel: string;
  phonePlaceholder: string;
}

export const MOBILE_MONEY_PROVIDERS: MobileMoneyProvider[] = [
  {
    id: "mtn",
    label: "MTN MoMo",
    phoneLabel: "MTN MoMo number",
    phonePlaceholder: "+250 78X XXX XXX",
  },
  {
    id: "airtel",
    label: "Airtel Money",
    phoneLabel: "Airtel Money number",
    phonePlaceholder: "+250 73X XXX XXX",
  },
];

export type ProviderPhones = Record<MobileMoneyProviderId, string>;

export function getMobileMoneyProvider(
  id: MobileMoneyProviderId,
): MobileMoneyProvider {
  return MOBILE_MONEY_PROVIDERS.find((p) => p.id === id) ?? MOBILE_MONEY_PROVIDERS[0];
}

export function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

export function validateProviderPhone(phone: string): string | null {
  const digits = normalizePhone(phone);
  if (digits.length < 9) {
    return "Enter a valid mobile money phone number.";
  }
  return null;
}

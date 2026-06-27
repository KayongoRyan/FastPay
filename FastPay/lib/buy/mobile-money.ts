export type MobileMoneyProviderId = "mtn" | "airtel";

export interface MobileMoneyProvider {
  id: MobileMoneyProviderId;
  label: string;
}

export const MOBILE_MONEY_PROVIDERS: MobileMoneyProvider[] = [
  { id: "mtn", label: "MTN MoMo" },
  { id: "airtel", label: "Airtel Money" },
];

export function getMobileMoneyProvider(
  id: MobileMoneyProviderId,
): MobileMoneyProvider {
  return MOBILE_MONEY_PROVIDERS.find((p) => p.id === id) ?? MOBILE_MONEY_PROVIDERS[0];
}

import type { VirtualCardItem } from "@/components/ui/VirtualCardCarousel";

export type CardTierId = "standard" | "bronze" | "silver" | "gold";

export type PurchasableTierId = Exclude<CardTierId, "standard">;

export interface CardTierDefinition {
  id: CardTierId;
  label: string;
  description: string;
  /** Minimum expected monthly account receive amount (RWF). */
  minMonthlyReceiveRwf: number;
  requirementLabel: string;
  gradientColors: [string, string];
  cardNumber: string;
  expiry: string;
  purchasable: boolean;
}

export const CARD_TIERS: Record<CardTierId, CardTierDefinition> = {
  standard: {
    id: "standard",
    label: "FastPay",
    description: "Default virtual card included with your wallet.",
    minMonthlyReceiveRwf: 0,
    requirementLabel: "Free",
    gradientColors: ["#1F5C52", "#0F3D38"],
    cardNumber: "2550 3456 7728 3504",
    expiry: "19/30",
    purchasable: false,
  },
  bronze: {
    id: "bronze",
    label: "Bronze",
    description: "Entry tier with bronze styling and basic perks.",
    minMonthlyReceiveRwf: 800_000,
    requirementLabel: "From 800,000 RWF / month received",
    gradientColors: ["#A8714A", "#6B4423"],
    cardNumber: "6201 4488 9012 7733",
    expiry: "08/28",
    purchasable: true,
  },
  silver: {
    id: "silver",
    label: "Silver",
    description: "Mid tier with higher limits and silver card design.",
    minMonthlyReceiveRwf: 5_000_000,
    requirementLabel: "From 5,000,000 RWF / month received",
    gradientColors: ["#BFC5CE", "#7B8494"],
    cardNumber: "4412 8890 1123 9087",
    expiry: "06/29",
    purchasable: true,
  },
  gold: {
    id: "gold",
    label: "Gold",
    description: "Premium tier with gold card design and priority support.",
    minMonthlyReceiveRwf: 23_000_000,
    requirementLabel: "From 23,000,000 RWF / month received",
    gradientColors: ["#E8C547", "#B8860B"],
    cardNumber: "9012 4567 3344 2100",
    expiry: "12/30",
    purchasable: true,
  },
};

export const PURCHASABLE_TIERS: PurchasableTierId[] = ["bronze", "silver", "gold"];

export function tierToCardItem(tierId: CardTierId): VirtualCardItem {
  const tier = CARD_TIERS[tierId];
  return {
    id: tier.id,
    tierId: tier.id,
    tierLabel: tier.label,
    cardNumber: tier.cardNumber,
    expiry: tier.expiry,
    gradientColors: tier.gradientColors,
  };
}

export function formatRwf(amount: number): string {
  return `${amount.toLocaleString()} RWF`;
}

export function parseRwfInput(value: string): number {
  const digits = value.replace(/[^\d]/g, "");
  return Number(digits) || 0;
}

export function validateTierReceiveAmount(
  tierId: PurchasableTierId,
  amountRwf: number,
): string | null {
  const min = CARD_TIERS[tierId].minMonthlyReceiveRwf;
  if (amountRwf < min) {
    return `Minimum for ${CARD_TIERS[tierId].label} is ${formatRwf(min)} per month received.`;
  }
  return null;
}

/** Highest purchasable tier the user qualifies for at this receive volume. */
export function getBestMatchingTier(
  monthlyReceiveRwf: number,
): PurchasableTierId | null {
  for (let i = PURCHASABLE_TIERS.length - 1; i >= 0; i -= 1) {
    const tierId = PURCHASABLE_TIERS[i];
    if (monthlyReceiveRwf >= CARD_TIERS[tierId].minMonthlyReceiveRwf) {
      return tierId;
    }
  }
  return null;
}

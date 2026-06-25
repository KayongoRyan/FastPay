import type { VirtualCardItem } from "@/components/ui/VirtualCardCarousel";

export type CardTierId = "standard" | "bronze" | "silver" | "gold";

export type PurchasableTierId = Exclude<CardTierId, "standard">;

export interface CardTierDefinition {
  id: CardTierId;
  label: string;
  description: string;
  priceRwf: number;
  billingLabel: string;
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
    priceRwf: 0,
    billingLabel: "Free",
    gradientColors: ["#1F5C52", "#0F3D38"],
    cardNumber: "2550 3456 7728 3504",
    expiry: "19/30",
    purchasable: false,
  },
  bronze: {
    id: "bronze",
    label: "Bronze",
    description: "Entry tier with bronze styling and basic perks.",
    priceRwf: 5_000,
    billingLabel: "5,000 RWF / month",
    gradientColors: ["#A8714A", "#6B4423"],
    cardNumber: "6201 4488 9012 7733",
    expiry: "08/28",
    purchasable: true,
  },
  silver: {
    id: "silver",
    label: "Silver",
    description: "Mid tier with higher limits and silver card design.",
    priceRwf: 15_000,
    billingLabel: "15,000 RWF / month",
    gradientColors: ["#BFC5CE", "#7B8494"],
    cardNumber: "4412 8890 1123 9087",
    expiry: "06/29",
    purchasable: true,
  },
  gold: {
    id: "gold",
    label: "Gold",
    description: "Premium tier with gold card design and priority support.",
    priceRwf: 35_000,
    billingLabel: "35,000 RWF / month",
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

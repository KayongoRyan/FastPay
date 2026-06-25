import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import type { VirtualCardItem } from "@/components/ui/VirtualCardCarousel";
import {
  CARD_TIERS,
  CardTierId,
  PurchasableTierId,
  tierToCardItem,
} from "@/lib/cards/tiers";

const OWNED_KEY = "fastpay_card_owned_tiers";
const ACTIVE_KEY = "fastpay_card_active_tier";

interface CardSubscriptionState {
  ownedTierIds: CardTierId[];
  activeTierId: CardTierId;
  isReady: boolean;
  isPurchasing: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  purchaseTier: (tierId: PurchasableTierId) => Promise<void>;
  applyTier: (tierId: CardTierId) => Promise<void>;
  getOwnedCards: () => VirtualCardItem[];
}

function parseOwnedTiers(raw: string | null): CardTierId[] {
  if (!raw) {
    return ["standard"];
  }

  try {
    const parsed = JSON.parse(raw) as CardTierId[];
    const unique = new Set<CardTierId>(["standard", ...parsed]);
    return Array.from(unique);
  } catch {
    return ["standard"];
  }
}

export const useCardSubscriptionStore = create<CardSubscriptionState>((set, get) => ({
  ownedTierIds: ["standard"],
  activeTierId: "standard",
  isReady: false,
  isPurchasing: false,
  error: null,

  initialize: async () => {
    const [ownedRaw, activeRaw] = await Promise.all([
      AsyncStorage.getItem(OWNED_KEY),
      AsyncStorage.getItem(ACTIVE_KEY),
    ]);

    const ownedTierIds = parseOwnedTiers(ownedRaw);
    const activeCandidate = (activeRaw as CardTierId | null) ?? "standard";
    const activeTierId = ownedTierIds.includes(activeCandidate)
      ? activeCandidate
      : "standard";

    set({ ownedTierIds, activeTierId, isReady: true, error: null });
  },

  purchaseTier: async (tierId) => {
    const { ownedTierIds, isPurchasing } = get();
    if (isPurchasing) {
      return;
    }

    if (ownedTierIds.includes(tierId)) {
      return;
    }

    set({ isPurchasing: true, error: null });

    try {
      await new Promise((resolve) => setTimeout(resolve, 700));

      const nextOwned = [...ownedTierIds, tierId];
      await AsyncStorage.setItem(OWNED_KEY, JSON.stringify(nextOwned));
      await AsyncStorage.setItem(ACTIVE_KEY, tierId);

      set({
        ownedTierIds: nextOwned,
        activeTierId: tierId,
        isPurchasing: false,
      });
    } catch {
      set({
        isPurchasing: false,
        error: `Could not purchase ${CARD_TIERS[tierId].label} subscription`,
      });
    }
  },

  applyTier: async (tierId) => {
    const { ownedTierIds } = get();
    if (!ownedTierIds.includes(tierId)) {
      return;
    }

    await AsyncStorage.setItem(ACTIVE_KEY, tierId);
    set({ activeTierId: tierId, error: null });
  },

  getOwnedCards: () => {
    const order: CardTierId[] = ["standard", "bronze", "silver", "gold"];
    return order
      .filter((tierId) => get().ownedTierIds.includes(tierId))
      .map(tierToCardItem);
  },
}));

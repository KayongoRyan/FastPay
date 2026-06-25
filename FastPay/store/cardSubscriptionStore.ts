import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import type { VirtualCardItem } from "@/components/ui/VirtualCardCarousel";
import {
  CARD_TIERS,
  CardTierId,
  PurchasableTierId,
  tierToCardItem,
  validateTierReceiveAmount,
} from "@/lib/cards/tiers";

const OWNED_KEY = "fastpay_card_owned_tiers";
const ACTIVE_KEY = "fastpay_card_active_tier";
const RECEIVE_KEY = "fastpay_card_tier_receive";

interface CardSubscriptionState {
  ownedTierIds: CardTierId[];
  activeTierId: CardTierId;
  tierReceiveAmounts: Partial<Record<CardTierId, number>>;
  isReady: boolean;
  isSubmitting: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  submitTierApplication: (
    tierId: PurchasableTierId,
    monthlyReceiveRwf: number,
  ) => Promise<boolean>;
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
  tierReceiveAmounts: {},
  isReady: false,
  isSubmitting: false,
  error: null,

  initialize: async () => {
    const [ownedRaw, activeRaw, receiveRaw] = await Promise.all([
      AsyncStorage.getItem(OWNED_KEY),
      AsyncStorage.getItem(ACTIVE_KEY),
      AsyncStorage.getItem(RECEIVE_KEY),
    ]);

    const ownedTierIds = parseOwnedTiers(ownedRaw);
    const activeCandidate = (activeRaw as CardTierId | null) ?? "standard";
    const activeTierId = ownedTierIds.includes(activeCandidate)
      ? activeCandidate
      : "standard";

    let tierReceiveAmounts: Partial<Record<CardTierId, number>> = {};
    if (receiveRaw) {
      try {
        tierReceiveAmounts = JSON.parse(receiveRaw) as Partial<
          Record<CardTierId, number>
        >;
      } catch {
        tierReceiveAmounts = {};
      }
    }

    set({ ownedTierIds, activeTierId, tierReceiveAmounts, isReady: true, error: null });
  },

  submitTierApplication: async (tierId, monthlyReceiveRwf) => {
    const { ownedTierIds, isSubmitting, tierReceiveAmounts } = get();
    if (isSubmitting) {
      return false;
    }

    const validationError = validateTierReceiveAmount(tierId, monthlyReceiveRwf);
    if (validationError) {
      set({ error: validationError });
      return false;
    }

    set({ isSubmitting: true, error: null });

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const nextOwned = ownedTierIds.includes(tierId)
        ? ownedTierIds
        : [...ownedTierIds, tierId];
      const nextReceive = {
        ...tierReceiveAmounts,
        [tierId]: monthlyReceiveRwf,
      };

      await Promise.all([
        AsyncStorage.setItem(OWNED_KEY, JSON.stringify(nextOwned)),
        AsyncStorage.setItem(ACTIVE_KEY, tierId),
        AsyncStorage.setItem(RECEIVE_KEY, JSON.stringify(nextReceive)),
      ]);

      set({
        ownedTierIds: nextOwned,
        activeTierId: tierId,
        tierReceiveAmounts: nextReceive,
        isSubmitting: false,
        error: null,
      });
      return true;
    } catch {
      set({
        isSubmitting: false,
        error: `Could not complete ${CARD_TIERS[tierId].label} application`,
      });
      return false;
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

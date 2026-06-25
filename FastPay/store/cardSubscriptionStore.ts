import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import type { VirtualCardItem } from "@/components/ui/VirtualCardCarousel";
import type { CardTierApplicationForm, TierVerificationContext } from "@/lib/cards/application";
import { verifyTierApplication } from "@/lib/cards/application";
import {
  CARD_TIERS,
  CardTierId,
  PurchasableTierId,
  tierToCardItem,
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
  isCancelling: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  submitTierApplication: (
    form: CardTierApplicationForm,
    context: TierVerificationContext,
  ) => Promise<{ approved: boolean; message: string }>;
  cancelTierCard: (tierId: PurchasableTierId) => Promise<boolean>;
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
  isCancelling: false,
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

  submitTierApplication: async (form, context) => {
    const { ownedTierIds, isSubmitting, tierReceiveAmounts } = get();
    if (isSubmitting) {
      return { approved: false, message: "Application already in progress." };
    }

    set({ isSubmitting: true, error: null });

    try {
      const verification = await verifyTierApplication(form, context);
      if (!verification.approved) {
        set({ isSubmitting: false, error: verification.message });
        return verification;
      }

      const { tierId, monthlyReceiveRwf } = form;
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
      return verification;
    } catch {
      const message = `Could not complete ${CARD_TIERS[form.tierId].label} application`;
      set({ isSubmitting: false, error: message });
      return { approved: false, message };
    }
  },

  cancelTierCard: async (tierId) => {
    const { ownedTierIds, activeTierId, tierReceiveAmounts, isCancelling } =
      get();
    if (isCancelling || !ownedTierIds.includes(tierId)) {
      return false;
    }

    set({ isCancelling: true, error: null });

    try {
      const nextOwned = ownedTierIds.filter((id) => id !== tierId);
      const nextActive = activeTierId === tierId ? "standard" : activeTierId;
      const { [tierId]: _removed, ...nextReceive } = tierReceiveAmounts;

      await Promise.all([
        AsyncStorage.setItem(OWNED_KEY, JSON.stringify(nextOwned)),
        AsyncStorage.setItem(ACTIVE_KEY, nextActive),
        AsyncStorage.setItem(RECEIVE_KEY, JSON.stringify(nextReceive)),
      ]);

      set({
        ownedTierIds: nextOwned,
        activeTierId: nextActive,
        tierReceiveAmounts: nextReceive,
        isCancelling: false,
        error: null,
      });
      return true;
    } catch {
      set({
        isCancelling: false,
        error: `Could not cancel ${CARD_TIERS[tierId].label} card`,
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

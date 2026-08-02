import { create } from "zustand";

import {
  getCachedMerchantUser,
  loginMerchant,
  logoutMerchant,
  registerMerchant,
} from "@/lib/portal/merchant-api";
import type { BusinessType } from "@/lib/portal/business-types";
import type { PortalUser } from "@/lib/portal/types";

interface MerchantAuthState {
  user: PortalUser | null;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  login: (identifier: string, password: string) => Promise<void>;
  register: (input: {
    fullName: string;
    password: string;
    email?: string;
    phone?: string;
    businessName: string;
    category: BusinessType;
    businessEmail?: string;
    businessPhone?: string;
    address?: string;
    city?: string;
    taxId?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useMerchantAuthStore = create<MerchantAuthState>((set) => ({
  user: null,
  isReady: false,
  isLoading: false,
  error: null,

  initialize: async () => {
    const user = await getCachedMerchantUser();
    set({ user, isReady: true });
  },

  login: async (identifier, password) => {
    set({ isLoading: true, error: null });
    try {
      const session = await loginMerchant(identifier, password);
      set({ user: session.user, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  register: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const session = await registerMerchant(input);
      set({ user: session.user, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    await logoutMerchant();
    set({ user: null, isLoading: false });
  },

  clearError: () => set({ error: null }),
}));

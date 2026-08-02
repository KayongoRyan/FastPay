import { create } from "zustand";

import {
  getCachedBusinessUser,
  loginBusiness,
  logoutBusiness,
  registerBusiness,
} from "@/lib/portal/business-api";
import type { BusinessType } from "@/lib/portal/business-types";
import type { PortalUser } from "@/lib/portal/types";

interface BusinessAuthState {
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
    companyName: string;
    businessType: BusinessType;
    industry?: string;
    companyEmail?: string;
    companyPhone?: string;
    address?: string;
    city?: string;
    country?: string;
    taxId?: string;
    registrationNumber?: string;
    website?: string;
    description?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useBusinessAuthStore = create<BusinessAuthState>((set) => ({
  user: null,
  isReady: false,
  isLoading: false,
  error: null,

  initialize: async () => {
    const user = await getCachedBusinessUser();
    set({ user, isReady: true });
  },

  login: async (identifier, password) => {
    set({ isLoading: true, error: null });
    try {
      const session = await loginBusiness(identifier, password);
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
      const session = await registerBusiness(input);
      set({ user: session.user, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    await logoutBusiness();
    set({ user: null, isLoading: false });
  },

  clearError: () => set({ error: null }),
}));

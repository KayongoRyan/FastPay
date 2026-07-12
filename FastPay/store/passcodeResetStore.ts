import { create } from "zustand";

const VERIFICATION_WINDOW_MS = 5 * 60 * 1000;

interface PasscodeResetState {
  verifiedAt: number | null;
  markVerified: () => void;
  isVerified: () => boolean;
  clear: () => void;
}

export const usePasscodeResetStore = create<PasscodeResetState>((set, get) => ({
  verifiedAt: null,

  markVerified: () => set({ verifiedAt: Date.now() }),

  isVerified: () => {
    const { verifiedAt } = get();
    if (!verifiedAt) {
      return false;
    }
    return Date.now() - verifiedAt < VERIFICATION_WINDOW_MS;
  },

  clear: () => set({ verifiedAt: null }),
}));

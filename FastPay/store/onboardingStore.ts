import { create } from "zustand";

interface OnboardingState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  pin: string;
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setPin: (value: string) => void;
  reset: () => void;
}

const initial = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  pin: "",
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initial,
  setFirstName: (firstName) => set({ firstName }),
  setLastName: (lastName) => set({ lastName }),
  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),
  setPin: (pin) => set({ pin }),
  reset: () => set(initial),
}));

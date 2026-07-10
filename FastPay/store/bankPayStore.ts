import { create } from "zustand";

export type BankPayDraft = {
  beneficiaryId: string;
  beneficiaryName: string;
  beneficiaryCategory: string;
  merchantCode: string;
  merchantName: string;
  amount: string;
  payFromName: string;
  payFromAccount: string;
  payToCode: string;
};

interface BankPayState {
  draft: BankPayDraft | null;
  setDraft: (draft: BankPayDraft) => void;
  clearDraft: () => void;
}

export const useBankPayStore = create<BankPayState>((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  clearDraft: () => set({ draft: null }),
}));

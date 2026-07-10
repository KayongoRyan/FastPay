export type BankPayBeneficiary = {
  id: string;
  name: string;
  category: string;
  fastPayCode: string;
};

export type BankPayMerchant = {
  code: string;
  name: string;
};

export type BankPayFormValues = {
  beneficiaryId: string | null;
  merchantCode: string;
  amount: string;
};

export interface StellarBalanceEntry {
  balance: string;
  assetType: string;
  assetCode?: string;
  assetIssuer?: string;
}

export interface WalletTransaction {
  id: string;
  title: string;
  date: string;
  amount: string;
  asset: string;
  direction: "in" | "out";
  counterparty?: string;
}

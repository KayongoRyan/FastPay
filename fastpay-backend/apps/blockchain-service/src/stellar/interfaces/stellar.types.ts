export interface StellarAccountKeys {
  publicKey: string;
  secretKey: string;
}

export interface StellarBalance {
  balance: string;
  assetType: string;
  assetCode?: string;
  assetIssuer?: string;
}

export interface BuiltTransaction {
  xdr: string;
  hash: string;
}

export interface SubmittedTransaction {
  hash: string;
  ledger: number;
  envelopeXdr: string;
  resultXdr: string;
}

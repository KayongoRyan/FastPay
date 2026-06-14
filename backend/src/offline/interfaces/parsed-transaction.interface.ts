export interface ParsedSignedTransaction {
  sourceAccount: string;
  sequence: string;
  fee: string;
  operationCount: number;
}

export interface QueueSignedTxResult {
  queueId: string;
  txHash: string;
}

export interface BroadcastJobData {
  signedXdr: string;
  txHash: string;
}

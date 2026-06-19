import { apiGet, apiPost } from './client';

export interface RelaySubmission {
  signedTxXDR: string;
  recipientPhone?: string;
}

export interface RelayResponse {
  accepted: boolean;
  queueId: string;
  estimatedSeconds: number;
}

export interface RelayStatusResponse {
  txHash: string;
  status: 'queued' | 'broadcasting' | 'confirmed' | 'failed';
  retryCount: number;
  lastError?: string | null;
  onChainTxHash?: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function submitOfflineRelay(
  payload: RelaySubmission,
): Promise<RelayResponse> {
  return apiPost<RelayResponse>('/offline/relay', payload);
}

export async function getRelayStatus(txHash: string): Promise<RelayStatusResponse> {
  return apiGet<RelayStatusResponse>(`/offline/relay/${txHash}`);
}

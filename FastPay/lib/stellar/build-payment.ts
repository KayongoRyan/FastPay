import {
  Asset,
  Memo,
  Operation,
  TransactionBuilder,
} from '@/lib/stellar/sdk';

import {
  STELLAR_HORIZON_URL,
  STELLAR_NETWORK_PASSPHRASE,
} from '@/lib/stellar/constants';
import {
  fetchHorizonBaseFee,
  loadHorizonAccount,
} from '@/lib/stellar/horizon-client';

export interface BuildPaymentParams {
  sourcePublicKey: string;
  destination: string;
  amount: string;
  assetCode?: string;
  assetIssuer?: string;
  memo?: string;
}

export async function buildUnsignedPayment(
  params: BuildPaymentParams,
): Promise<string> {
  const [account, fee] = await Promise.all([
    loadHorizonAccount(params.sourcePublicKey),
    fetchHorizonBaseFee(),
  ]);

  const asset =
    params.assetCode && params.assetIssuer
      ? new Asset(params.assetCode, params.assetIssuer)
      : Asset.native();

  let builder = new TransactionBuilder(account, {
    fee,
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  }).addOperation(
    Operation.payment({
      destination: params.destination,
      asset,
      amount: params.amount,
    }),
  );

  if (params.memo) {
    builder = builder.addMemo(Memo.text(params.memo));
  }

  return builder.setTimeout(180).build().toXDR();
}

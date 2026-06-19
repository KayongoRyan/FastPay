import {
  Asset,
  Horizon,
  Memo,
  Operation,
  TransactionBuilder,
} from '@stellar/stellar-sdk';

import {
  STELLAR_HORIZON_URL,
  STELLAR_NETWORK_PASSPHRASE,
} from '@/lib/stellar/constants';

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
  const server = new Horizon.Server(STELLAR_HORIZON_URL, {
    allowHttp: STELLAR_HORIZON_URL.startsWith('http://'),
  });
  const account = await server.loadAccount(params.sourcePublicKey);
  const fee = await server.fetchBaseFee();

  const asset =
    params.assetCode && params.assetIssuer
      ? new Asset(params.assetCode, params.assetIssuer)
      : Asset.native();

  let builder = new TransactionBuilder(account, {
    fee: fee.toString(),
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

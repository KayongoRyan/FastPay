import { FeeBumpTransaction, Operation, TransactionBuilder } from '@stellar/stellar-sdk';

export function parsePaymentFromXdr(
  signedXdr: string,
  networkPassphrase: string,
): {
  source: string;
  destination: string;
  amount: string;
  asset: string;
} | null {
  try {
    const parsed = TransactionBuilder.fromXDR(signedXdr, networkPassphrase);

    if (parsed instanceof FeeBumpTransaction) {
      return null;
    }

    const paymentOp = parsed.operations.find(
      (operation) => operation.type === 'payment',
    ) as Operation & {
      destination?: string;
      amount?: string;
      asset?: { code?: string; issuer?: string };
    };

    if (!paymentOp?.destination || !paymentOp.amount) {
      return null;
    }

    const asset =
      paymentOp.asset && 'code' in paymentOp.asset && paymentOp.asset.code
        ? paymentOp.asset.code
        : 'XLM';

    return {
      source: parsed.source,
      destination: paymentOp.destination,
      amount: paymentOp.amount,
      asset,
    };
  } catch {
    return null;
  }
}

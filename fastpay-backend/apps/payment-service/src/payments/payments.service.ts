import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FeeBumpTransaction, Operation, TransactionBuilder } from '@stellar/stellar-sdk';
import { Model } from 'mongoose';

import { OfflineRelay, OfflineRelayDocument } from '@fastpay/schemas';

export interface PaymentHistoryItem {
  id: string;
  txHash: string;
  status: string;
  amount: string;
  asset: string;
  direction: 'in' | 'out';
  counterparty: string;
  createdAt: string;
}

@Injectable()
export class PaymentsService {
  private readonly networkPassphrase: string;

  constructor(
    @InjectModel(OfflineRelay.name)
    private readonly offlineRelayModel: Model<OfflineRelayDocument>,
  ) {
    this.networkPassphrase = process.env.STELLAR_NETWORK_PASSPHRASE ??
      'Test SDF Network ; September 2015';
  }

  async getHistoryForPublicKey(publicKey: string): Promise<PaymentHistoryItem[]> {
    const relays = await this.offlineRelayModel
      .find()
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();

    const items: PaymentHistoryItem[] = [];

    for (const relay of relays) {
      const parsed = this.parsePayment(relay.signedXdr);
      if (!parsed) {
        continue;
      }

      if (parsed.source !== publicKey && parsed.destination !== publicKey) {
        continue;
      }

      const direction = parsed.source === publicKey ? 'out' : 'in';
      items.push({
        id: relay._id.toString(),
        txHash: relay.txHash,
        status: relay.status,
        amount: parsed.amount,
        asset: parsed.asset,
        direction,
        counterparty:
          direction === 'out' ? parsed.destination : parsed.source,
        createdAt: relay.createdAt?.toISOString() ?? new Date().toISOString(),
      });
    }

    return items.slice(0, 30);
  }

  private parsePayment(signedXdr: string): {
    source: string;
    destination: string;
    amount: string;
    asset: string;
  } | null {
    try {
      const parsed = TransactionBuilder.fromXDR(
        signedXdr,
        this.networkPassphrase,
      );

      if (parsed instanceof FeeBumpTransaction) {
        return null;
      }

      const transaction = parsed;

      const paymentOp = transaction.operations.find(
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
        source: transaction.source,
        destination: paymentOp.destination,
        amount: paymentOp.amount,
        asset,
      };
    } catch {
      return null;
    }
  }
}

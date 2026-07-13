import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  KycDocument,
  KycDocumentSchema,
  KnowledgeChunkCategory,
  MomoPayment,
  MomoPaymentSchema,
  Transaction,
  TransactionSchema,
  Wallet,
  WalletSchema,
} from '@fastpay/schemas';

import { redactPii } from '../common/assistant.utils';
import { IndexerService } from './indexer.service';

@Injectable()
export class UserSummaryJobService {
  constructor(
    private readonly configService: ConfigService,
    private readonly indexer: IndexerService,
    @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>,
    @InjectModel(MomoPayment.name) private readonly momoModel: Model<MomoPayment>,
    @InjectModel(Transaction.name) private readonly txModel: Model<Transaction>,
    @InjectModel(KycDocument.name) private readonly kycModel: Model<KycDocument>,
  ) {}

  async indexUser(userId: string, authorization?: string): Promise<{ indexed: number }> {
    const chunks: {
      text: string;
      source: string;
      title?: string;
      category: KnowledgeChunkCategory;
      route?: string;
      actionRoute?: string;
    }[] = [];

    const wallet = await this.walletModel
      .findOne({ userId: new Types.ObjectId(userId), isDefault: true })
      .lean()
      .exec();

    if (wallet?.publicKey) {
      const momoPayments = await this.momoModel
        .find({ walletPublicKey: wallet.publicKey })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean()
        .exec();

      for (const payment of momoPayments) {
        const createdAt = (payment as { createdAt?: Date }).createdAt;
        chunks.push({
          text: redactPii(
            `MoMo ${payment.provider} top-up ${payment.amountRwf} RWF status ${payment.status} on ${createdAt?.toISOString?.() ?? 'unknown date'}. ${payment.message ?? ''}`,
          ),
          source: 'momo_payments',
          title: `MoMo ${payment.provider}`,
          category: KnowledgeChunkCategory.TRANSACTION,
          route: '/buy',
          actionRoute: `/buy?provider=${payment.provider}`,
        });
      }

      const transactions = await this.txModel
        .find({ $or: [{ fromAddress: wallet.publicKey }, { toAddress: wallet.publicKey }] })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean()
        .exec();

      for (const tx of transactions) {
        const createdAt = (tx as { createdAt?: Date }).createdAt;
        chunks.push({
          text: redactPii(
            `Wallet ${tx.type} ${tx.status}: ${tx.netAmount} ${tx.token} from ${tx.fromAddress} to ${tx.toAddress} on ${createdAt?.toISOString?.() ?? 'unknown date'}.`,
          ),
          source: 'transactions',
          title: `Transaction ${tx.type}`,
          category: KnowledgeChunkCategory.TRANSACTION,
          route: '/analytics',
          actionRoute: '/analytics?mode=cashflow',
        });
      }
    }

    const kycDocs = await this.kycModel
      .find({ userId: new Types.ObjectId(userId) })
      .lean()
      .exec();

    if (kycDocs.length > 0) {
      const summary = kycDocs
        .map((doc) => `${doc.documentType}: ${doc.verificationStatus}`)
        .join(', ');
      chunks.push({
        text: `KYC documents for user: ${summary}`,
        source: 'kyc_documents',
        title: 'KYC status',
        category: KnowledgeChunkCategory.KYC,
        route: '/(auth)/kyc',
        actionRoute: '/(auth)/kyc',
      });
    } else if (authorization) {
      try {
        const kycUrl = this.configService.getOrThrow<string>('assistant.kycServiceUrl');
        const response = await fetch(`${kycUrl}/kyc/status`, {
          headers: { Authorization: authorization },
        });
        if (response.ok) {
          const status = (await response.json()) as Record<string, unknown>;
          chunks.push({
            text: redactPii(`KYC status snapshot: ${JSON.stringify(status)}`),
            source: 'kyc/status',
            title: 'KYC status',
            category: KnowledgeChunkCategory.KYC,
            route: '/(auth)/kyc',
            actionRoute: '/(auth)/kyc',
          });
        }
      } catch {
        // optional remote KYC fetch
      }
    }

    if (chunks.length === 0) {
      return { indexed: 0 };
    }

    const spendSignals = chunks.filter((c) => c.category === KnowledgeChunkCategory.TRANSACTION).length;
    const riskFlags: string[] = [];
    if (spendSignals >= 15) {
      riskFlags.push('high_spend');
    }
    if (kycDocs.length === 0) {
      riskFlags.push('low_kyc');
    }

    const profileChunk = [
      `income: ? RWF`,
      `spend: ?%`,
      `savings: ?%`,
      `topIntents: []`,
      `portfolio: USDT/BTC/SOL`,
      `riskFlags: [${riskFlags.join(', ')}]`,
      `recentTransactions: ${spendSignals}`,
    ].join(' | ');

    chunks.unshift({
      text: `User profile summary: ${profileChunk}`,
      source: 'user_profile',
      title: 'User profile',
      category: KnowledgeChunkCategory.BUDGET,
      route: '/analytics',
      actionRoute: '/analytics',
    });

    return this.indexer.upsertUserChunks(userId, chunks);
  }
}

// Register schemas for injection — re-export for module
export const UserSummarySchemas = [
  { name: Wallet.name, schema: WalletSchema },
  { name: MomoPayment.name, schema: MomoPaymentSchema },
  { name: Transaction.name, schema: TransactionSchema },
  { name: KycDocument.name, schema: KycDocumentSchema },
];

import { createHash } from 'crypto';

import { InjectQueue } from '@nestjs/bullmq';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { FeeBumpTransaction, TransactionBuilder } from '@stellar/stellar-sdk';
import { Queue } from 'bullmq';
import { Model } from 'mongoose';

import {
  OfflineRelay,
  OfflineRelayDocument,
  OfflineRelayStatus,
  Transaction,
  TransactionDocument,
  TransactionStatus,
  TransactionType,
  Wallet,
  WalletDocument,
} from '@fastpay/schemas';

import { PAYMENT_AUDIT_ACTIONS } from '../audit/audit.constants';
import { PaymentAuditService } from '../audit/payment-audit.service';
import { BlockchainClient } from '../clients/blockchain.client';
import {
  BroadcastJobData,
  ParsedSignedTransaction,
  QueueSignedTxResult,
} from './interfaces/parsed-transaction.interface';
import { parsePaymentFromXdr } from './parse-payment.util';

@Injectable()
export class OfflineService {
  private readonly logger = new Logger(OfflineService.name);
  private readonly networkPassphrase: string;
  private readonly retryAttempts: number;
  private readonly retryBackoffMs: number;
  private readonly inlineOfflineQueue: boolean;

  constructor(
    @InjectModel(OfflineRelay.name)
    private readonly offlineRelayModel: Model<OfflineRelayDocument>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,
    @Optional() @InjectQueue('offline-tx')
    private readonly offlineQueue: Queue<BroadcastJobData> | undefined,
    private readonly blockchainClient: BlockchainClient,
    private readonly configService: ConfigService,
    private readonly paymentAudit: PaymentAuditService,
  ) {
    this.networkPassphrase = this.configService.getOrThrow<string>(
      'stellar.networkPassphrase',
    );
    this.retryAttempts = this.configService.getOrThrow<number>(
      'offline.retryAttempts',
    );
    this.retryBackoffMs = this.configService.getOrThrow<number>(
      'offline.retryBackoffMs',
    );
    this.inlineOfflineQueue = process.env.FASTPAY_INLINE_OFFLINE_QUEUE === 'true';
  }

  hashSignedXdr(signedXdr: string): string {
    return createHash('sha256').update(signedXdr).digest('hex');
  }

  parseSignedXdr(signedXdr: string): ParsedSignedTransaction {
    const parsed = TransactionBuilder.fromXDR(
      signedXdr,
      this.networkPassphrase,
    );

    if (parsed instanceof FeeBumpTransaction) {
      throw new ConflictException('Fee bump transactions are not supported');
    }

    return {
      sourceAccount: parsed.source,
      sequence: parsed.sequence,
      fee: parsed.fee,
      operationCount: parsed.operations.length,
    };
  }

  async findByTxHash(txHash: string): Promise<OfflineRelayDocument | null> {
    return this.offlineRelayModel.findOne({ txHash }).exec();
  }

  async getRelayStatus(txHash: string) {
    const relay = await this.findByTxHash(txHash);
    if (!relay) {
      throw new NotFoundException(`Relay ${txHash} not found`);
    }

    return {
      txHash: relay.txHash,
      status: relay.status,
      retryCount: relay.retryCount,
      lastError: relay.lastError,
      onChainTxHash: relay.onChainTxHash,
      createdAt: relay.createdAt,
      updatedAt: relay.updatedAt,
    };
  }

  async queueSignedTx(
    signedTxXDR: string,
    txHash: string,
    recipientPhone?: string,
    fraudMeta?: { riskScore?: number; decision?: string },
  ): Promise<QueueSignedTxResult> {
    const existing = await this.findByTxHash(txHash);
    if (existing) {
      throw new ConflictException(
        `Transaction with hash ${txHash} is already queued`,
      );
    }

    const parsed = this.parseSignedXdr(signedTxXDR);
    this.logger.log(
      `Queueing offline tx ${txHash} from ${parsed.sourceAccount} seq=${parsed.sequence}`,
    );

    const wallet = await this.walletModel
      .findOne({ publicKey: parsed.sourceAccount })
      .exec();

    const status =
      fraudMeta?.decision === 'review'
        ? OfflineRelayStatus.PENDING_REVIEW
        : OfflineRelayStatus.QUEUED;

    const payment = parsePaymentFromXdr(signedTxXDR, this.networkPassphrase);

    const session = await this.offlineRelayModel.db.startSession();
    session.startTransaction();

    try {
      await this.offlineRelayModel.create(
        [
          {
            txHash,
            signedXdr: signedTxXDR,
            status,
            recipientPhone,
            fraudRiskScore: fraudMeta?.riskScore,
            fraudDecision: fraudMeta?.decision,
            walletId: wallet?._id,
          },
        ],
        { session },
      );

      if (wallet && payment) {
        await this.transactionModel.create(
          [
            {
              walletId: wallet._id,
              txHash,
              chain: 'stellar',
              type: TransactionType.TRANSFER,
              amount: payment.amount,
              token: payment.asset,
              netAmount: Number.parseFloat(payment.amount),
              fromAddress: payment.source,
              toAddress: payment.destination,
              status: TransactionStatus.QUEUED,
            },
          ],
          { session },
        );
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          `Transaction with hash ${txHash} is already queued`,
        );
      }
      throw error;
    } finally {
      await session.endSession();
    }

    await this.paymentAudit.record({
      action: PAYMENT_AUDIT_ACTIONS.RELAY_ACCEPTED,
      userId: wallet?.userId?.toString(),
      details: { txHash, status, fraudDecision: fraudMeta?.decision },
    });

    try {
      if (this.inlineOfflineQueue || !this.offlineQueue) {
        const willBroadcast = status !== OfflineRelayStatus.PENDING_REVIEW;
        // #region agent log
        (() => {
          const payload = {sessionId:'208281',runId:'post-fix',hypothesisId:'A,B',location:'offline.service.ts:queueSignedTx',message:'inline branch',data:{txHash,status,inline:this.inlineOfflineQueue,hasQueue:Boolean(this.offlineQueue),willBroadcast,fraudDecision:fraudMeta?.decision},timestamp:Date.now()};
          try { require('node:fs').appendFileSync(require('node:path').resolve(process.cwd(), '../.cursor/debug-208281.log'), JSON.stringify(payload)+'\n'); } catch { /* ignore */ }
          try { require('node:fs').appendFileSync(require('node:path').resolve(process.cwd(), '../../.cursor/debug-208281.log'), JSON.stringify(payload)+'\n'); } catch { /* ignore */ }
          fetch('http://127.0.0.1:7374/ingest/e5785f1a-1397-4b7d-b3c8-78db776e0924',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'208281'},body:JSON.stringify(payload)}).catch(()=>{});
        })();
        // #endregion
        if (willBroadcast) {
          setImmediate(() => {
            void this.processInlineBroadcast(signedTxXDR, txHash);
          });
        }
        return { queueId: txHash, txHash };
      }

      if (status === OfflineRelayStatus.PENDING_REVIEW) {
        // #region agent log
        fetch('http://127.0.0.1:7374/ingest/e5785f1a-1397-4b7d-b3c8-78db776e0924',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'208281'},body:JSON.stringify({sessionId:'208281',runId:'pre-fix',hypothesisId:'A,B',location:'offline.service.ts:queueSignedTx',message:'bullmq skipped pending_review',data:{txHash,status},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        return { queueId: txHash, txHash };
      }

      // #region agent log
      fetch('http://127.0.0.1:7374/ingest/e5785f1a-1397-4b7d-b3c8-78db776e0924',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'208281'},body:JSON.stringify({sessionId:'208281',runId:'pre-fix',hypothesisId:'B',location:'offline.service.ts:queueSignedTx',message:'bullmq enqueue',data:{txHash,status,inline:this.inlineOfflineQueue},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      const job = await this.offlineQueue.add(
        'broadcast',
        { signedXdr: signedTxXDR, txHash },
        {
          jobId: txHash,
          attempts: this.retryAttempts,
          backoff: {
            type: 'exponential',
            delay: this.retryBackoffMs,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );

      return {
        queueId: job.id ?? txHash,
        txHash,
      };
    } catch (error) {
      await this.offlineRelayModel.deleteOne({ txHash }).exec();
      await this.transactionModel.deleteOne({ txHash }).exec();
      this.logger.error(
        `Failed to enqueue tx ${txHash}: ${error instanceof Error ? error.message : error}`,
      );
      throw new ServiceUnavailableException('Offline transaction queue is unavailable');
    }
  }

  async updateStatus(
    txHash: string,
    status: OfflineRelayStatus,
    onChainTxHash?: string,
    lastError?: string,
    retryCount?: number,
  ): Promise<OfflineRelayDocument | null> {
    const update: Partial<OfflineRelay> = {
      status,
      updatedAt: new Date(),
    };

    if (onChainTxHash !== undefined) {
      update.onChainTxHash = onChainTxHash;
    }

    if (lastError !== undefined) {
      update.lastError = lastError;
    }

    if (retryCount !== undefined) {
      update.retryCount = retryCount;
    }

    const relay = await this.offlineRelayModel
      .findOneAndUpdate({ txHash }, { $set: update }, { new: true })
      .exec();

    const txStatus = this.mapRelayToTransactionStatus(status);
    if (txStatus) {
      const txUpdate: Partial<Transaction> = { status: txStatus };
      if (status === OfflineRelayStatus.CONFIRMED) {
        txUpdate.confirmedAt = new Date();
      }
      await this.transactionModel
        .updateOne({ txHash }, { $set: txUpdate })
        .exec();
    }

    if (status === OfflineRelayStatus.CONFIRMED) {
      const wallet = relay?.walletId
        ? await this.walletModel.findById(relay.walletId).exec()
        : null;
      await this.paymentAudit.record({
        action: PAYMENT_AUDIT_ACTIONS.RELAY_CONFIRMED,
        userId: wallet?.userId?.toString(),
        details: { txHash, onChainTxHash },
      });
    }

    if (status === OfflineRelayStatus.FAILED) {
      await this.paymentAudit.record({
        action: PAYMENT_AUDIT_ACTIONS.RELAY_FAILED,
        details: { txHash, lastError },
      });
    }

    return relay;
  }

  private mapRelayToTransactionStatus(
    status: OfflineRelayStatus,
  ): TransactionStatus | null {
    switch (status) {
      case OfflineRelayStatus.QUEUED:
        return TransactionStatus.QUEUED;
      case OfflineRelayStatus.BROADCASTING:
        return TransactionStatus.BROADCASTING;
      case OfflineRelayStatus.CONFIRMED:
        return TransactionStatus.CONFIRMED;
      case OfflineRelayStatus.FAILED:
        return TransactionStatus.FAILED;
      default:
        return null;
    }
  }

  private async processInlineBroadcast(
    signedXdr: string,
    txHash: string,
  ): Promise<void> {
    // #region agent log
    fetch('http://127.0.0.1:7374/ingest/e5785f1a-1397-4b7d-b3c8-78db776e0924',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'208281'},body:JSON.stringify({sessionId:'208281',runId:'pre-fix',hypothesisId:'C,D',location:'offline.service.ts:processInlineBroadcast',message:'inline broadcast start',data:{txHash},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    await this.updateStatus(
      txHash,
      OfflineRelayStatus.BROADCASTING,
      undefined,
      undefined,
      0,
    );

    try {
      const onChainTxHash = await this.blockchainClient.submit(signedXdr);
      await this.updateStatus(
        txHash,
        OfflineRelayStatus.CONFIRMED,
        onChainTxHash,
      );
      // #region agent log
      fetch('http://127.0.0.1:7374/ingest/e5785f1a-1397-4b7d-b3c8-78db776e0924',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'208281'},body:JSON.stringify({sessionId:'208281',runId:'pre-fix',hypothesisId:'C,D',location:'offline.service.ts:processInlineBroadcast',message:'inline broadcast confirmed',data:{txHash,onChainTxHash},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      this.logger.log(
        `Inline broadcast confirmed for ${txHash} -> on-chain ${onChainTxHash}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await this.updateStatus(
        txHash,
        OfflineRelayStatus.FAILED,
        undefined,
        message,
        1,
      );
      // #region agent log
      fetch('http://127.0.0.1:7374/ingest/e5785f1a-1397-4b7d-b3c8-78db776e0924',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'208281'},body:JSON.stringify({sessionId:'208281',runId:'pre-fix',hypothesisId:'D',location:'offline.service.ts:processInlineBroadcast',message:'inline broadcast failed',data:{txHash,error:message},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      this.logger.error(`Inline broadcast failed for ${txHash}: ${message}`);
    }
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: number }).code === 11000
    );
  }
}

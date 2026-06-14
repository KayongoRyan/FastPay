import { createHash } from 'crypto';

import { InjectQueue } from '@nestjs/bullmq';
import {
  ConflictException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Queue } from 'bullmq';
import { Model } from 'mongoose';

import { StellarService } from '../stellar/stellar.service';
import {
  BroadcastJobData,
  ParsedSignedTransaction,
  QueueSignedTxResult,
} from './interfaces/parsed-transaction.interface';
import {
  OfflineRelay,
  OfflineRelayDocument,
  OfflineRelayStatus,
} from './offline.schema';

@Injectable()
export class OfflineService {
  private readonly logger = new Logger(OfflineService.name);
  private readonly queueName: string;
  private readonly retryAttempts: number;
  private readonly retryBackoffMs: number;

  constructor(
    @InjectModel(OfflineRelay.name)
    private readonly offlineRelayModel: Model<OfflineRelayDocument>,
    @InjectQueue('offline-tx')
    private readonly offlineQueue: Queue<BroadcastJobData>,
    private readonly stellarService: StellarService,
    private readonly configService: ConfigService,
  ) {
    this.queueName = this.configService.getOrThrow<string>('offline.queueName');
    this.retryAttempts = this.configService.getOrThrow<number>(
      'offline.retryAttempts',
    );
    this.retryBackoffMs = this.configService.getOrThrow<number>(
      'offline.retryBackoffMs',
    );
  }

  hashSignedXdr(signedXdr: string): string {
    return createHash('sha256').update(signedXdr).digest('hex');
  }

  parseSignedXdr(signedXdr: string): ParsedSignedTransaction {
    const transaction = this.stellarService.parseTransaction(signedXdr);

    return {
      sourceAccount: transaction.source,
      sequence: transaction.sequence,
      fee: transaction.fee,
      operationCount: transaction.operations.length,
    };
  }

  async findByTxHash(txHash: string): Promise<OfflineRelayDocument | null> {
    return this.offlineRelayModel.findOne({ txHash }).exec();
  }

  async queueSignedTx(
    signedTxXDR: string,
    txHash: string,
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

    let relay: OfflineRelayDocument;
    try {
      relay = await this.offlineRelayModel.create({
        txHash,
        signedXdr: signedTxXDR,
        status: OfflineRelayStatus.QUEUED,
      });
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          `Transaction with hash ${txHash} is already queued`,
        );
      }
      throw error;
    }

    try {
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

    return this.offlineRelayModel
      .findOneAndUpdate({ txHash }, { $set: update }, { new: true })
      .exec();
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

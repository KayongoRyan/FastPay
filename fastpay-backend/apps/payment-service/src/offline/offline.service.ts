import { createHash } from 'crypto';

import { InjectQueue } from '@nestjs/bullmq';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { FeeBumpTransaction, TransactionBuilder } from '@stellar/stellar-sdk';
import { Queue } from 'bullmq';
import { Model } from 'mongoose';

import { OfflineRelay, OfflineRelayDocument, OfflineRelayStatus } from '@fastpay/schemas';

import { BlockchainClient } from '../clients/blockchain.client';
import {
  BroadcastJobData,
  ParsedSignedTransaction,
  QueueSignedTxResult,
} from './interfaces/parsed-transaction.interface';

@Injectable()
export class OfflineService {
  private readonly logger = new Logger(OfflineService.name);
  private readonly networkPassphrase: string;
  private readonly retryAttempts: number;
  private readonly retryBackoffMs: number;

  constructor(
    @InjectModel(OfflineRelay.name)
    private readonly offlineRelayModel: Model<OfflineRelayDocument>,
    @InjectQueue('offline-tx')
    private readonly offlineQueue: Queue<BroadcastJobData>,
    private readonly blockchainClient: BlockchainClient,
    private readonly configService: ConfigService,
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

    try {
      await this.offlineRelayModel.create({
        txHash,
        signedXdr: signedTxXDR,
        status: OfflineRelayStatus.QUEUED,
        recipientPhone,
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

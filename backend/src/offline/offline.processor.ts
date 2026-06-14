import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';

import { StellarService } from '../stellar/stellar.service';
import { BroadcastJobData } from './interfaces/parsed-transaction.interface';
import { OfflineService } from './offline.service';
import { OfflineRelayStatus } from './offline.schema';

@Processor('offline-tx')
export class OfflineProcessor extends WorkerHost {
  private readonly logger = new Logger(OfflineProcessor.name);
  private readonly retryAttempts: number;

  constructor(
    private readonly offlineService: OfflineService,
    private readonly stellarService: StellarService,
    private readonly configService: ConfigService,
  ) {
    super();
    this.retryAttempts = this.configService.getOrThrow<number>(
      'offline.retryAttempts',
    );
  }

  async process(job: Job<BroadcastJobData>): Promise<void> {
    if (job.name === 'broadcast') {
      await this.handleBroadcast(job);
    }
  }

  async handleBroadcast(job: Job<BroadcastJobData>): Promise<void> {
    const { signedXdr, txHash } = job.data;

    await this.offlineService.updateStatus(
      txHash,
      OfflineRelayStatus.BROADCASTING,
      undefined,
      undefined,
      job.attemptsMade,
    );

    try {
      const onChainTxHash = await this.stellarService.submit(signedXdr);

      await this.offlineService.updateStatus(
        txHash,
        OfflineRelayStatus.CONFIRMED,
        onChainTxHash,
      );

      this.logger.log(
        `Broadcast confirmed for ${txHash} -> on-chain ${onChainTxHash}`,
      );
    } catch (error) {
      const message = this.extractErrorMessage(error);
      const isBadSequence = this.isBadSequenceError(message);

      if (isBadSequence) {
        const parsed = this.offlineService.parseSignedXdr(signedXdr);
        try {
          const latestSequence = await this.stellarService.getAccountSequence(
            parsed.sourceAccount,
          );
          this.logger.warn(
            `Bad sequence for ${txHash}: tx seq=${parsed.sequence}, account seq=${latestSequence}. Re-sign required; retrying.`,
          );
        } catch (sequenceError) {
          this.logger.warn(
            `Bad sequence for ${txHash}, failed to fetch latest account sequence: ${this.extractErrorMessage(sequenceError)}`,
          );
        }
      }

      await this.offlineService.updateStatus(
        txHash,
        OfflineRelayStatus.BROADCASTING,
        undefined,
        message,
        job.attemptsMade + 1,
      );

      this.logger.error(
        `Broadcast attempt ${job.attemptsMade + 1}/${this.retryAttempts} failed for ${txHash}: ${message}`,
      );

      throw error;
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<BroadcastJobData>, error: Error): Promise<void> {
    const maxAttempts = job.opts.attempts ?? this.retryAttempts;

    if (job.attemptsMade < maxAttempts) {
      return;
    }

    await this.offlineService.updateStatus(
      job.data.txHash,
      OfflineRelayStatus.FAILED,
      undefined,
      error.message,
      job.attemptsMade,
    );

    this.logger.error(
      `Broadcast permanently failed for ${job.data.txHash} after ${job.attemptsMade} attempts: ${error.message}`,
    );
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      if (this.isHorizonError(error)) {
        const detail = error.response?.data?.extras?.result_codes
          ? JSON.stringify(error.response.data.extras.result_codes)
          : error.response?.data?.detail;

        return detail ?? error.message;
      }

      return error.message;
    }

    return String(error);
  }

  private isBadSequenceError(message: string): boolean {
    const normalized = message.toLowerCase();
    return (
      normalized.includes('bad_seq') ||
      normalized.includes('bad sequence') ||
      normalized.includes('tx_bad_seq')
    );
  }

  private isHorizonError(
    error: Error,
  ): error is Error & {
    response?: {
      data?: {
        detail?: string;
        extras?: { result_codes?: unknown };
      };
    };
  } {
    return 'response' in error;
  }
}

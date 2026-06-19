import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';

import { BlockchainClient } from '../clients/blockchain.client';
import { BroadcastJobData } from './interfaces/parsed-transaction.interface';
import { OfflineService } from './offline.service';
import { OfflineRelayStatus } from '@fastpay/schemas';

@Processor('offline-tx')
export class OfflineProcessor extends WorkerHost {
  private readonly logger = new Logger(OfflineProcessor.name);
  private readonly retryAttempts: number;

  constructor(
    private readonly offlineService: OfflineService,
    private readonly blockchainClient: BlockchainClient,
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
      const onChainTxHash = await this.blockchainClient.submit(signedXdr);

      await this.offlineService.updateStatus(
        txHash,
        OfflineRelayStatus.CONFIRMED,
        onChainTxHash,
      );

      this.logger.log(
        `Broadcast confirmed for ${txHash} -> on-chain ${onChainTxHash}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const isBadSequence = message.toLowerCase().includes('bad_seq');

      if (isBadSequence) {
        const parsed = this.offlineService.parseSignedXdr(signedXdr);
        try {
          const latestSequence = await this.blockchainClient.getAccountSequence(
            parsed.sourceAccount,
          );
          this.logger.warn(
            `Bad sequence for ${txHash}: tx seq=${parsed.sequence}, account seq=${latestSequence}`,
          );
        } catch (sequenceError) {
          this.logger.warn(
            `Bad sequence for ${txHash}, failed to fetch latest account sequence`,
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
  }
}

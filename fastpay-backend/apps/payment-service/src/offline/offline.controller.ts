import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BlockchainClient } from '../clients/blockchain.client';
import { FraudClient } from '../clients/fraud.client';
import { RelayDto } from './dto/relay.dto';
import { OfflineService } from './offline.service';

@Controller('offline')
export class OfflineController {
  private readonly estimatedSeconds: number;

  constructor(
    private readonly offlineService: OfflineService,
    private readonly blockchainClient: BlockchainClient,
    private readonly fraudClient: FraudClient,
    private readonly configService: ConfigService,
  ) {
    this.estimatedSeconds = this.configService.getOrThrow<number>(
      'offline.estimatedSeconds',
    );
  }

  @Post('relay')
  async relay(@Body() dto: RelayDto) {
    const isValid = await this.blockchainClient.verifySignedXdr(dto.signedTxXDR);
    if (!isValid) {
      throw new BadRequestException('Invalid Stellar transaction signature');
    }

    await this.fraudClient.assertSignedTransaction(dto.signedTxXDR);

    const txHash = this.offlineService.hashSignedXdr(dto.signedTxXDR);
    const result = await this.offlineService.queueSignedTx(
      dto.signedTxXDR,
      txHash,
      dto.recipientPhone,
    );

    return {
      accepted: true,
      queueId: result.queueId,
      estimatedSeconds: this.estimatedSeconds,
    };
  }

  @Get('relay/:txHash')
  getRelayStatus(@Param('txHash') txHash: string) {
    return this.offlineService.getRelayStatus(txHash);
  }
}

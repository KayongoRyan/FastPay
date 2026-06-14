import {
  BadRequestException,
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { StellarService } from '../stellar/stellar.service';
import { RelayDto } from './dto/relay.dto';
import { OfflineService } from './offline.service';

@Controller('offline')
export class OfflineController {
  private readonly estimatedSeconds: number;

  constructor(
    private readonly offlineService: OfflineService,
    private readonly stellarService: StellarService,
    private readonly configService: ConfigService,
  ) {
    this.estimatedSeconds = this.configService.getOrThrow<number>(
      'offline.estimatedSeconds',
    );
  }

  @Post('relay')
  async relay(@Body() dto: RelayDto) {
    const isValid = await this.stellarService.verifySignedXdr(dto.signedTxXDR);
    if (!isValid) {
      throw new BadRequestException('Invalid Stellar transaction signature');
    }

    const txHash = this.offlineService.hashSignedXdr(dto.signedTxXDR);
    const result = await this.offlineService.queueSignedTx(
      dto.signedTxXDR,
      txHash,
    );

    return {
      accepted: true,
      queueId: result.queueId,
      estimatedSeconds: this.estimatedSeconds,
    };
  }
}

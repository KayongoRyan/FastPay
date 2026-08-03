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

    const fraud = await this.fraudClient.assertSignedTransaction(dto.signedTxXDR);

    // #region agent log
    (() => {
      const payload = {sessionId:'208281',runId:'post-fix',hypothesisId:'A',location:'offline.controller.ts:relay',message:'fraud assert result',data:{decision:fraud.decision,riskScore:fraud.riskScore,ruleHits:fraud.ruleHits,reasons:fraud.reasons,allowed:fraud.allowed},timestamp:Date.now()};
      try { require('node:fs').appendFileSync(require('node:path').resolve(process.cwd(), '../.cursor/debug-208281.log'), JSON.stringify(payload)+'\n'); } catch { /* ignore */ }
      try { require('node:fs').appendFileSync(require('node:path').resolve(process.cwd(), '../../.cursor/debug-208281.log'), JSON.stringify(payload)+'\n'); } catch { /* ignore */ }
      fetch('http://127.0.0.1:7374/ingest/e5785f1a-1397-4b7d-b3c8-78db776e0924',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'208281'},body:JSON.stringify(payload)}).catch(()=>{});
    })();
    // #endregion

    const txHash = this.offlineService.hashSignedXdr(dto.signedTxXDR);
    const result = await this.offlineService.queueSignedTx(
      dto.signedTxXDR,
      txHash,
      dto.recipientPhone,
      { riskScore: fraud.riskScore, decision: fraud.decision },
    );

    return {
      accepted: true,
      queueId: result.queueId,
      txHash: result.txHash,
      estimatedSeconds: fraud.decision === 'review' ? 0 : this.estimatedSeconds,
      fraudDecision: fraud.decision,
      riskScore: fraud.riskScore,
    };
  }

  @Get('relay/:txHash')
  getRelayStatus(@Param('txHash') txHash: string) {
    return this.offlineService.getRelayStatus(txHash);
  }
}

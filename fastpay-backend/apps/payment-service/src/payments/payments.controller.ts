import { Controller, Get, Param } from '@nestjs/common';

import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('history/:publicKey')
  getHistory(@Param('publicKey') publicKey: string) {
    return this.paymentsService.getHistoryForPublicKey(publicKey);
  }
}

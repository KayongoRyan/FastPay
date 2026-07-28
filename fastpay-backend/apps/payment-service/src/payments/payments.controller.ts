import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { PaymentHistoryGuard } from '../auth/payment-history.guard';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('history/:publicKey')
  @UseGuards(PaymentHistoryGuard)
  getHistory(@Param('publicKey') publicKey: string) {
    return this.paymentsService.getHistoryForPublicKey(publicKey);
  }
}

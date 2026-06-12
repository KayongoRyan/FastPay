import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { BuildPaymentDto } from './dto/build-payment.dto';
import { CreateAccountDto } from './dto/create-account.dto';
import { SubmitTransactionDto } from './dto/submit-transaction.dto';
import { StellarService } from './stellar.service';

@Controller('stellar')
export class StellarController {
  constructor(private readonly stellarService: StellarService) {}

  @Post('accounts')
  createAccount(@Body() dto: CreateAccountDto) {
    return this.stellarService.createAccount(dto.fundWithFriendbot ?? true);
  }

  @Post('transactions/payment')
  buildPayment(@Body() dto: BuildPaymentDto) {
    return this.stellarService.buildPaymentTransaction(dto);
  }

  @Post('transactions/submit')
  submitTransaction(@Body() dto: SubmitTransactionDto) {
    return this.stellarService.submitTransaction(dto.xdr);
  }

  @Get('accounts/:publicKey/balance')
  getBalance(@Param('publicKey') publicKey: string) {
    return this.stellarService.getBalance(publicKey);
  }
}

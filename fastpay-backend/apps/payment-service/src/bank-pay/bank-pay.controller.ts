import { Body, Controller, Get, Headers, Param, Post, UseGuards } from '@nestjs/common';

import { CurrentUserId, JwtAuthGuard } from '@fastpay/common';

import { BankPayDto } from './dto/bank-pay.dto';
import { BankPayService } from './bank-pay.service';

@Controller('payments/bank-pay')
export class BankPayController {
  constructor(private readonly bankPayService: BankPayService) {}

  @Get('lookup/:code')
  lookup(@Param('code') code: string) {
    return this.bankPayService.lookup(code);
  }

  @Post('pay')
  @UseGuards(JwtAuthGuard)
  pay(
    @CurrentUserId() userId: string,
    @Headers('authorization') authorization: string,
    @Body() dto: BankPayDto,
  ) {
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length)
      : '';
    return this.bankPayService.pay(token, userId, dto);
  }
}

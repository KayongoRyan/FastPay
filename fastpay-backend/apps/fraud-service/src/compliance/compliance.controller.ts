import { Body, Controller, Post } from '@nestjs/common';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { ComplianceService } from './compliance.service';

class AssertTransactionDto {
  @IsString()
  @IsNotEmpty()
  signedXdr!: string;

  @IsOptional()
  @IsString()
  userId?: string;
}

class AssertPaymentDto {
  @IsString()
  @IsNotEmpty()
  source!: string;

  @IsString()
  @IsNotEmpty()
  destination!: string;

  @IsOptional()
  @IsString()
  amount?: string;

  @IsOptional()
  @IsString()
  asset?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}

class ScreenDto {
  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsString()
  @IsNotEmpty()
  direction!: 'outgoing' | 'incoming';

  @IsOptional()
  @IsString()
  amount?: string;

  @IsOptional()
  @IsString()
  asset?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  txHash?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  destination?: string;
}

@Controller('compliance')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post('screen')
  screen(@Body() dto: ScreenDto) {
    return this.complianceService.screen(dto);
  }

  @Post('transactions/assert')
  async assertTransaction(@Body() dto: AssertTransactionDto) {
    return this.complianceService.assertSignedTransactionAllowed(
      dto.signedXdr,
      dto.userId,
    );
  }

  @Post('payments/assert')
  assertPayment(@Body() dto: AssertPaymentDto) {
    return this.complianceService.assertOutgoingPaymentAllowed(dto);
  }
}

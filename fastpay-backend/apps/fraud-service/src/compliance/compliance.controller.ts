import { Body, Controller, Post } from '@nestjs/common';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { ComplianceService } from './compliance.service';

class AssertTransactionDto {
  @IsString()
  @IsNotEmpty()
  signedXdr!: string;
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
}

@Controller('compliance')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post('transactions/assert')
  assertTransaction(@Body() dto: AssertTransactionDto) {
    return this.complianceService.assertSignedTransactionAllowed(dto.signedXdr);
  }

  @Post('payments/assert')
  assertPayment(@Body() dto: AssertPaymentDto) {
    return this.complianceService.assertOutgoingPaymentAllowed(dto);
  }
}

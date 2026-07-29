import { IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

import { MerchantPaymentChannel } from '@fastpay/schemas';

export class CreateInvoiceDto {
  @IsInt()
  @Min(100)
  amountRwf!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  expiresInHours?: number;
}

export class UpdateOrgDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  businessName?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  businessEmail?: string;

  @IsOptional()
  @IsString()
  businessPhone?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

export class CreateOrgInternalDto {
  @IsString()
  ownerUserId!: string;

  @IsString()
  @MinLength(2)
  businessName!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  businessEmail?: string;

  @IsOptional()
  @IsString()
  businessPhone?: string;
}

export class RecordPaymentInternalDto {
  @IsString()
  orgId!: string;

  @IsInt()
  @Min(1)
  amountRwf!: number;

  @IsEnum(MerchantPaymentChannel)
  channel!: MerchantPaymentChannel;

  @IsOptional()
  @IsString()
  consumerUserId?: string;

  @IsOptional()
  @IsString()
  invoiceId?: string;

  @IsOptional()
  @IsString()
  merchantCode?: string;

  @IsOptional()
  @IsString()
  paymentRef?: string;

  @IsOptional()
  @IsString()
  txHash?: string;

  @IsOptional()
  @IsString()
  beneficiaryLabel?: string;
}

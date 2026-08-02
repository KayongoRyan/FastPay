import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateEscrowDto {
  @IsString()
  @MinLength(3)
  merchantCode!: string;

  @IsInt()
  @Min(100)
  amountRwf!: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  requiresBuyerConfirm?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  autoReleaseHoursAfterDelivery?: number;
}

export class FundEscrowDto {
  @IsOptional()
  @IsString()
  paymentRef?: string;
}

export class ShipEscrowDto {
  @IsOptional()
  @IsString()
  shippingNote?: string;
}

export class DisputeEscrowDto {
  @IsString()
  @MinLength(5)
  reason!: string;
}

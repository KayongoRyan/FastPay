import { IsOptional, IsString, IsInt, Min, MinLength } from 'class-validator';

export class CreateOrderInternalDto {
  @IsString()
  merchantOrgId!: string;

  @IsString()
  buyerUserId!: string;

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
  @IsString()
  escrowId?: string;
}

export class UpdateOrderStatusInternalDto {
  @IsString()
  @MinLength(2)
  status!: string;

  @IsOptional()
  @IsString()
  shippingNote?: string;
}

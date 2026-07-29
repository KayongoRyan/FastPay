import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class BankPayDto {
  @IsString()
  @MinLength(3)
  merchantCode!: string;

  @IsInt()
  @Min(100)
  amountRwf!: number;

  @IsOptional()
  @IsString()
  beneficiaryLabel?: string;

  @IsOptional()
  @IsString()
  memo?: string;
}

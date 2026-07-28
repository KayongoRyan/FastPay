import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class TransferDto {
  @IsString()
  destination!: string;

  @IsNumber()
  @Min(100)
  amountRwf!: number;

  @IsOptional()
  @IsString()
  memo?: string;
}

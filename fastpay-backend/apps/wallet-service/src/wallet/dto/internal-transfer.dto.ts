import { IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class InternalTransferDto {
  @IsMongoId()
  userId!: string;

  @IsString()
  destination!: string;

  @IsNumber()
  @Min(100)
  amountRwf!: number;

  @IsOptional()
  @IsString()
  memo?: string;
}

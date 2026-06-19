import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class BuildPaymentDto {
  @IsString()
  @IsNotEmpty()
  sourceSecret!: string;

  @IsString()
  @IsNotEmpty()
  destination!: string;

  @IsString()
  @Matches(/^\d+(\.\d{1,7})?$/, {
    message: 'amount must be a valid Stellar amount (up to 7 decimal places)',
  })
  amount!: string;

  @IsOptional()
  @IsString()
  assetCode?: string;

  @IsOptional()
  @IsString()
  assetIssuer?: string;

  @IsOptional()
  @IsString()
  memo?: string;
}

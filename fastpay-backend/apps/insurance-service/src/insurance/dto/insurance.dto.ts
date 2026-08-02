import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class EnableInsuranceDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  desiredCoverageLimitRwf?: number;
}

export class SubmitClaimDto {
  @IsInt()
  @Min(100)
  amountRwf!: number;

  @IsString()
  @MinLength(8)
  reason!: string;

  @IsOptional()
  @IsString()
  drainTxRef?: string;

  @IsOptional()
  @IsString()
  evidenceNote?: string;
}

export class ReviewClaimDto {
  @IsString()
  status!: 'approved' | 'rejected';

  @IsOptional()
  @IsString()
  reviewNote?: string;
}

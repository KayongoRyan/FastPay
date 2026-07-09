import { IsIn, IsInt, IsString, Min } from 'class-validator';

export class InitiateMomoDto {
  @IsIn(['mtn', 'airtel'])
  provider!: 'mtn' | 'airtel';

  @IsString()
  phone!: string;

  @IsInt()
  @Min(100)
  amountRwf!: number;

  @IsString()
  walletPublicKey!: string;
}

import { IsIn, IsOptional, IsString, Matches } from 'class-validator';

export class ScreenAddressDto {
  @IsString()
  @Matches(/^G[A-Z2-7]{55}$/, {
    message: 'address must be a valid Stellar public key',
  })
  address!: string;

  @IsIn(['outgoing', 'incoming'])
  direction!: 'outgoing' | 'incoming';

  @IsOptional()
  @IsString()
  asset?: string;

  @IsOptional()
  @IsString()
  amount?: string;
}

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RelayDto {
  @IsString()
  @IsNotEmpty()
  signedTxXDR!: string;

  @IsOptional()
  @IsString()
  recipientPhone?: string;
}

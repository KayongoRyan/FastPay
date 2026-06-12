import { IsNotEmpty, IsString } from 'class-validator';

export class SubmitTransactionDto {
  @IsString()
  @IsNotEmpty()
  xdr!: string;
}

import { IsIn, IsString, MinLength } from 'class-validator';

export class UploadKycDocumentDto {
  @IsIn(['id_card', 'proof_of_address'])
  documentType!: 'id_card' | 'proof_of_address';

  @IsString()
  @MinLength(1)
  fileName!: string;

  @IsString()
  @MinLength(8)
  contentBase64!: string;
}

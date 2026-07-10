import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export const ID_SUBTYPES = [
  'national_id',
  'passport',
  'drivers_license',
] as const;

export const POA_TYPES = [
  'utility_bill',
  'bank_statement',
  'lease_agreement',
  'tax_notice',
] as const;

export class UploadKycDocumentDto {
  @IsIn(['id_card', 'proof_of_address'])
  documentType!: 'id_card' | 'proof_of_address';

  @IsOptional()
  @IsIn(ID_SUBTYPES)
  idSubtype?: (typeof ID_SUBTYPES)[number];

  @IsOptional()
  @IsIn(POA_TYPES)
  poaType?: (typeof POA_TYPES)[number];

  @IsString()
  @MinLength(1)
  fileName!: string;

  @IsString()
  @MinLength(8)
  contentBase64!: string;

  /** Name visible on the document — cross-checked against account holder. */
  @IsOptional()
  @IsString()
  @MinLength(2)
  holderName?: string;

  /** Required for proof-of-address (must be within 90 days). */
  @IsOptional()
  @IsDateString()
  issueDate?: string;
}

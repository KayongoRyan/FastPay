import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

import { BusinessType } from '@fastpay/schemas';

export class RegisterBusinessDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @ValidateIf((dto: RegisterBusinessDto) => !dto.email)
  @IsString()
  @IsNotEmpty()
  phone?: string;

  @ValidateIf((dto: RegisterBusinessDto) => !dto.phone)
  @IsEmail()
  email?: string;

  @IsString()
  @IsNotEmpty()
  companyName!: string;

  @IsEnum(BusinessType)
  businessType!: BusinessType;

  /** Custom label when businessType is `other`, or extra detail. */
  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  companyEmail?: string;

  @IsOptional()
  @IsString()
  companyPhone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

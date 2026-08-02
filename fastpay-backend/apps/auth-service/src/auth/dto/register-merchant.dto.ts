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

export class RegisterMerchantDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @ValidateIf((dto: RegisterMerchantDto) => !dto.email)
  @IsString()
  @IsNotEmpty()
  phone?: string;

  @ValidateIf((dto: RegisterMerchantDto) => !dto.phone)
  @IsEmail()
  email?: string;

  @IsString()
  @IsNotEmpty()
  businessName!: string;

  @IsEnum(BusinessType)
  category!: BusinessType;

  @IsOptional()
  @IsString()
  businessEmail?: string;

  @IsOptional()
  @IsString()
  businessPhone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  taxId?: string;
}

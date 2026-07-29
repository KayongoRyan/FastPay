import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

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

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  businessEmail?: string;

  @IsOptional()
  @IsString()
  businessPhone?: string;
}

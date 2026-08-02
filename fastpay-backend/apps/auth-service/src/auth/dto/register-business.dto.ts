import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

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
  country?: string;
}

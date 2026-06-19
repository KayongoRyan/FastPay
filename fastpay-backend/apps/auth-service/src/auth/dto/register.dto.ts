import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @ValidateIf((dto: RegisterDto) => !dto.email)
  @IsString()
  @IsNotEmpty()
  phone?: string;

  @ValidateIf((dto: RegisterDto) => !dto.phone)
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  nationalId?: string;
}

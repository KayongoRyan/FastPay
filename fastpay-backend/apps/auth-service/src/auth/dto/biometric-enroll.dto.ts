import {
  IsBoolean,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class BiometricEnrollDto {
  @IsBoolean()
  enabled!: boolean;

  @ValidateIf((dto: BiometricEnrollDto) => dto.enabled)
  @IsString()
  @MinLength(8)
  deviceId?: string;

  @ValidateIf((dto: BiometricEnrollDto) => dto.enabled)
  @IsString()
  @MinLength(32)
  publicKey?: string;
}

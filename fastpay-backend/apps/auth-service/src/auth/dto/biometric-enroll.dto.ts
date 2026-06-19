import { IsBoolean } from 'class-validator';

export class BiometricEnrollDto {
  @IsBoolean()
  enabled!: boolean;
}

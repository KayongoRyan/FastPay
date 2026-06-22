import { IsString, MinLength } from 'class-validator';

export class BiometricChallengeQueryDto {
  @IsString()
  @MinLength(8)
  deviceId!: string;
}

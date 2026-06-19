import { IsBoolean, IsOptional } from 'class-validator';

export class CreateAccountDto {
  @IsOptional()
  @IsBoolean()
  fundWithFriendbot?: boolean = true;
}

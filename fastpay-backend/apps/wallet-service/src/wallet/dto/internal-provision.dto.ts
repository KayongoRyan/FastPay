import { IsMongoId } from 'class-validator';

export class InternalProvisionDto {
  @IsMongoId()
  userId!: string;
}

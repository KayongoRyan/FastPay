import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class FeedbackRequestDto {
  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsString()
  messageId!: string;

  @IsIn([1, -1])
  rating!: 1 | -1;

  @IsString()
  intent!: string;

  @IsNumber()
  confidence!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  chunkIds?: string[];

  @IsIn(['local', 'cloud'])
  engine!: 'local' | 'cloud';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}

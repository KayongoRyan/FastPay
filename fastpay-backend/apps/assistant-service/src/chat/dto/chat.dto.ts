import { Type } from 'class-transformer';
import {
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class BudgetGoalSnapshotDto {
  @IsString()
  name!: string;

  @IsOptional()
  targetRwf?: number;

  @IsOptional()
  savedRwf?: number;

  @IsOptional()
  @IsString()
  deadline?: string;
}

export class FamilyChildSnapshotDto {
  @IsString()
  label!: string;

  @IsOptional()
  lockYears?: number;

  @IsOptional()
  savedRwf?: number;
}

export class FamilyPlanSnapshotDto {
  @IsOptional()
  yearlyIncomePercent?: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FamilyChildSnapshotDto)
  children?: FamilyChildSnapshotDto[];
}

export class BudgetSnapshotDto {
  @IsOptional()
  monthlyIncomeRwf?: number;

  @IsOptional()
  spendPercent?: number;

  @IsOptional()
  savingsPercent?: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BudgetGoalSnapshotDto)
  goals?: BudgetGoalSnapshotDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => FamilyPlanSnapshotDto)
  familyPlan?: FamilyPlanSnapshotDto;
}

export class ChatContextDto {
  @IsOptional()
  @IsString()
  currentRoute?: string;

  @IsOptional()
  @IsString()
  screenTitle?: string;

  @IsOptional()
  @IsString()
  walletPublicKey?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => BudgetSnapshotDto)
  budgetSnapshot?: BudgetSnapshotDto;
}

export class ChatRequestDto {
  @IsString()
  @MaxLength(2000)
  message!: string;

  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChatContextDto)
  context?: ChatContextDto;
}

export class RebuildIndexDto {
  @IsString()
  secret!: string;
}

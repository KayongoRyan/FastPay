import {
  IsEnum,
  IsIn,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

import { ApprovalRequestStatus, FamilyRole } from '@fastpay/schemas';

export class CreateFamilyDto {
  @IsString()
  @MinLength(2)
  name!: string;
}

export class UpdateFamilyDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;
}

export class InviteMemberDto {
  @IsString()
  @MinLength(3)
  identifier!: string;

  @IsOptional()
  @IsEnum(FamilyRole)
  role?: FamilyRole;

  @IsOptional()
  @IsInt()
  @Min(0)
  spendingLimitDaily?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  spendingLimitMonthly?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  requiresApprovalAbove?: number;
}

export class UpdateMemberDto {
  @IsOptional()
  @IsEnum(FamilyRole)
  role?: FamilyRole;

  @IsOptional()
  @IsInt()
  @Min(0)
  spendingLimitDaily?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  spendingLimitMonthly?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  requiresApprovalAbove?: number;

  @IsOptional()
  isActive?: boolean;
}

export class CreateSavingsGoalDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsInt()
  @Min(1000)
  targetAmount!: number;

  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  deadline?: string;
}

export class ContributeGoalDto {
  @IsInt()
  @Min(100)
  amount!: number;

  @IsOptional()
  @IsString()
  transactionHash?: string;
}

export class CreateApprovalDto {
  @IsString()
  destination!: string;

  @IsNumber()
  @Min(100)
  amountRwf!: number;

  @IsOptional()
  @IsString()
  memo?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class ResolveApprovalDto {
  @IsIn([ApprovalRequestStatus.APPROVED, ApprovalRequestStatus.REJECTED])
  status!: ApprovalRequestStatus.APPROVED | ApprovalRequestStatus.REJECTED;

  @IsOptional()
  @IsString()
  parentSignature?: string;
}

export class FamilyIdParamDto {
  @IsMongoId()
  familyId!: string;
}

export class MemberIdParamDto {
  @IsMongoId()
  memberId!: string;
}

export class GoalIdParamDto {
  @IsMongoId()
  goalId!: string;
}

export class RequestIdParamDto {
  @IsMongoId()
  requestId!: string;
}

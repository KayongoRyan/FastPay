import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

import {
  MerchantEmployeeRole,
  MerchantEmployeeStatus,
  MerchantGoalHorizon,
  MerchantGoalKind,
  MerchantGoalStatus,
  MerchantPayCycle,
  MerchantPaymentChannel,
  MerchantProductStatus,
  MerchantStockMovementType,
} from '@fastpay/schemas';

export class CreateInvoiceDto {
  @IsInt()
  @Min(100)
  amountRwf!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  expiresInHours?: number;
}

export class UpdateOrgDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  businessName?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  businessEmail?: string;

  @IsOptional()
  @IsString()
  businessPhone?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

export class CreateOrgInternalDto {
  @IsString()
  ownerUserId!: string;

  @IsString()
  @MinLength(2)
  businessName!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  businessEmail?: string;

  @IsOptional()
  @IsString()
  businessPhone?: string;

  @IsOptional()
  @IsString()
  businessOrgId?: string;
}

export class LinkBusinessInternalDto {
  @IsString()
  merchantCode!: string;

  @IsString()
  businessOrgId!: string;

  @IsString()
  ownerUserId!: string;
}

export class RecordPaymentInternalDto {
  @IsString()
  orgId!: string;

  @IsInt()
  @Min(1)
  amountRwf!: number;

  @IsEnum(MerchantPaymentChannel)
  channel!: MerchantPaymentChannel;

  @IsOptional()
  @IsString()
  consumerUserId?: string;

  @IsOptional()
  @IsString()
  invoiceId?: string;

  @IsOptional()
  @IsString()
  merchantCode?: string;

  @IsOptional()
  @IsString()
  paymentRef?: string;

  @IsOptional()
  @IsString()
  txHash?: string;

  @IsOptional()
  @IsString()
  beneficiaryLabel?: string;
}

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQty?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reorderLevel?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPriceRwf?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sellPriceRwf?: number;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reorderLevel?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPriceRwf?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sellPriceRwf?: number;

  @IsOptional()
  @IsEnum(MerchantProductStatus)
  status?: MerchantProductStatus;
}

export class StockMovementDto {
  @IsString()
  productId!: string;

  @IsEnum(MerchantStockMovementType)
  type!: MerchantStockMovementType;

  @IsNumber()
  @Min(0.0001)
  quantity!: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateEmployeeDto {
  @IsString()
  @MinLength(2)
  fullName!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsEnum(MerchantEmployeeRole)
  role?: MerchantEmployeeRole;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryRwf?: number;

  @IsOptional()
  @IsEnum(MerchantPayCycle)
  payCycle?: MerchantPayCycle;

  @IsOptional()
  @IsString()
  hiredAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsEnum(MerchantEmployeeRole)
  role?: MerchantEmployeeRole;

  @IsOptional()
  @IsEnum(MerchantEmployeeStatus)
  status?: MerchantEmployeeStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryRwf?: number;

  @IsOptional()
  @IsEnum(MerchantPayCycle)
  payCycle?: MerchantPayCycle;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreatePayrollDto {
  @IsString()
  employeeId!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amountRwf?: number;

  @IsString()
  periodStart!: string;

  @IsString()
  periodEnd!: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsBoolean()
  markPaid?: boolean;
}

export class CreateGoalDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(MerchantGoalHorizon)
  horizon?: MerchantGoalHorizon;

  @IsOptional()
  @IsEnum(MerchantGoalKind)
  kind?: MerchantGoalKind;

  @IsNumber()
  @Min(1)
  targetValue!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentValue?: number;

  @IsOptional()
  @IsString()
  deadline?: string;
}

export class UpdateGoalDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(MerchantGoalHorizon)
  horizon?: MerchantGoalHorizon;

  @IsOptional()
  @IsEnum(MerchantGoalKind)
  kind?: MerchantGoalKind;

  @IsOptional()
  @IsNumber()
  @Min(1)
  targetValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentValue?: number;

  @IsOptional()
  @IsString()
  deadline?: string;

  @IsOptional()
  @IsEnum(MerchantGoalStatus)
  status?: MerchantGoalStatus;
}

export class BumpGoalDto {
  @IsNumber()
  amount!: number;
}

import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

import {
  SUPPORTED_CHAINS,
  type SupportedChain,
} from '../../config/chains.config';

const CHAINS = SUPPORTED_CHAINS as unknown as string[];

export class BroadcastTxDto {
  @IsEnum(CHAINS)
  chain!: SupportedChain;

  /** Signed raw tx hex (0x…) for EVM, or base64 for Solana */
  @IsString()
  @IsNotEmpty()
  signedTx!: string;
}

export class ContractCallDto {
  @IsEnum(CHAINS)
  chain!: SupportedChain;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsArray()
  @ArrayMinSize(1)
  abi!: unknown[];

  @IsString()
  @IsNotEmpty()
  method!: string;

  @IsOptional()
  @IsArray()
  args?: unknown[];

  @IsOptional()
  @IsString()
  from?: string;
}

export class EncodeContractDto {
  @IsArray()
  @ArrayMinSize(1)
  abi!: unknown[];

  @IsString()
  @IsNotEmpty()
  method!: string;

  @IsOptional()
  @IsArray()
  args?: unknown[];
}

export class GasEstimateDto {
  @IsEnum(CHAINS)
  chain!: SupportedChain;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsString()
  data?: string;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsString()
  priority?: 'slow' | 'standard' | 'fast';
}

export class EventFilterDto {
  @IsEnum(CHAINS)
  chain!: SupportedChain;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topics?: string[];

  @IsOptional()
  @IsBoolean()
  poll?: boolean;
}

export class SubscribeEventsDto {
  @ValidateNested()
  @Type(() => EventFilterDto)
  filter!: EventFilterDto;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxEvents?: number;
}

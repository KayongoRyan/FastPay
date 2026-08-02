import { Injectable, Logger } from '@nestjs/common';

import type { SupportedChain } from '../config/chains.config';
import { NodeRpcManager } from './node-rpc.manager';

type Priority = 'slow' | 'standard' | 'fast';

const MULTIPLIERS: Record<Priority, number> = {
  slow: 0.9,
  standard: 1.1,
  fast: 1.4,
};

@Injectable()
export class GasOptimizerService {
  private readonly logger = new Logger(GasOptimizerService.name);

  constructor(private readonly rpc: NodeRpcManager) {}

  async suggest(chain: SupportedChain, priority: Priority = 'standard') {
    if (chain === 'solana') {
      return this.suggestSolana(priority);
    }
    return this.suggestEvm(chain, priority);
  }

  async estimate(params: {
    chain: SupportedChain;
    from?: string;
    to?: string;
    data?: string;
    value?: string;
    priority?: Priority;
  }) {
    const priority = params.priority ?? 'standard';
    const fees = await this.suggest(params.chain, priority);

    if (params.chain === 'solana') {
      return {
        ...fees,
        estimatedComputeUnits: 200_000,
        note: 'Pass compute unit price from prioritizationFees into your tx',
      };
    }

    const provider = this.rpc.getEvmProvider(params.chain);
    let gasLimit: string | null = null;
    if (params.to) {
      try {
        const estimate = await this.rpc.withRetry(
          `${params.chain}.estimateGas`,
          () =>
            provider.estimateGas({
              from: params.from,
              to: params.to,
              data: params.data,
              value: params.value ? BigInt(params.value) : undefined,
            }),
        );
        // +20% headroom
        gasLimit = ((estimate * 120n) / 100n).toString();
      } catch (err) {
        this.logger.warn(
          `estimateGas failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    return { ...fees, gasLimit };
  }

  private async suggestEvm(
    chain: Exclude<SupportedChain, 'solana'>,
    priority: Priority,
  ) {
    const provider = this.rpc.getEvmProvider(chain);
    const fee = await this.rpc.withRetry(`${chain}.feeData`, () =>
      provider.getFeeData(),
    );
    const mult = MULTIPLIERS[priority];

    const maxPriority =
      fee.maxPriorityFeePerGas != null
        ? BigInt(Math.ceil(Number(fee.maxPriorityFeePerGas) * mult))
        : null;
    const maxFee =
      fee.maxFeePerGas != null
        ? BigInt(Math.ceil(Number(fee.maxFeePerGas) * mult))
        : null;
    const gasPrice =
      fee.gasPrice != null
        ? BigInt(Math.ceil(Number(fee.gasPrice) * mult))
        : null;

    return {
      chain,
      family: 'evm' as const,
      priority,
      eip1559: {
        maxFeePerGas: maxFee?.toString() ?? null,
        maxPriorityFeePerGas: maxPriority?.toString() ?? null,
      },
      legacy: {
        gasPrice: gasPrice?.toString() ?? null,
      },
      baseFeeHint: fee.maxFeePerGas?.toString() ?? null,
    };
  }

  private async suggestSolana(priority: Priority) {
    const conn = this.rpc.getSolana();
    let microLamports = 1_000;
    try {
      const recent = await this.rpc.withRetry('solana.priorityFees', () =>
        conn.getRecentPrioritizationFees(),
      );
      if (recent.length) {
        const sorted = recent
          .map((r) => r.prioritizationFee)
          .sort((a, b) => a - b);
        const mid = sorted[Math.floor(sorted.length / 2)] ?? 0;
        microLamports = Math.max(
          1,
          Math.ceil(mid * MULTIPLIERS[priority]),
        );
      }
    } catch (err) {
      this.logger.warn(
        `priority fees failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    return {
      chain: 'solana' as const,
      family: 'solana' as const,
      priority,
      prioritizationFeeMicroLamports: microLamports,
    };
  }
}

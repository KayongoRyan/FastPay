import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection } from '@solana/web3.js';
import { JsonRpcProvider } from 'ethers';

import {
  EVM_CHAINS,
  type EvmChainId,
  type SupportedChain,
  SUPPORTED_CHAINS,
} from '../config/chains.config';

@Injectable()
export class NodeRpcManager implements OnModuleDestroy {
  private readonly logger = new Logger(NodeRpcManager.name);
  private readonly evm = new Map<EvmChainId, JsonRpcProvider>();
  private solana: Connection | null = null;
  private readonly maxRetries: number;

  constructor(private readonly config: ConfigService) {
    this.maxRetries = this.config.get<number>('chains.maxRpcRetries') ?? 3;
    for (const chain of EVM_CHAINS) {
      const url = this.config.getOrThrow<string>(`chains.rpc.${chain}`);
      this.evm.set(chain, new JsonRpcProvider(url, undefined, { staticNetwork: true }));
      this.logger.log(`RPC ready: ${chain} → ${url}`);
    }
    const solUrl = this.config.getOrThrow<string>('chains.rpc.solana');
    this.solana = new Connection(solUrl, 'confirmed');
    this.logger.log(`RPC ready: solana → ${solUrl}`);
  }

  onModuleDestroy() {
    for (const p of this.evm.values()) {
      void p.destroy();
    }
    this.evm.clear();
    this.solana = null;
  }

  listChains(): SupportedChain[] {
    return [...SUPPORTED_CHAINS];
  }

  isEvm(chain: SupportedChain): chain is EvmChainId {
    return (EVM_CHAINS as string[]).includes(chain);
  }

  assertSupported(chain: string): SupportedChain {
    if (!(SUPPORTED_CHAINS as string[]).includes(chain)) {
      throw new BadRequestException(
        `Unsupported chain "${chain}". Use: ${SUPPORTED_CHAINS.join(', ')}`,
      );
    }
    return chain as SupportedChain;
  }

  getEvmProvider(chain: EvmChainId): JsonRpcProvider {
    const p = this.evm.get(chain);
    if (!p) throw new BadRequestException(`No EVM RPC for ${chain}`);
    return p;
  }

  getSolana(): Connection {
    if (!this.solana) throw new BadRequestException('Solana RPC not configured');
    return this.solana;
  }

  getRpcUrl(chain: SupportedChain): string {
    return this.config.getOrThrow<string>(`chains.rpc.${chain}`);
  }

  getEvmChainId(chain: EvmChainId): number {
    return this.config.getOrThrow<number>(`chains.chainIds.${chain}`);
  }

  async withRetry<T>(label: string, fn: () => Promise<T>): Promise<T> {
    let last: unknown;
    for (let i = 1; i <= this.maxRetries; i++) {
      try {
        return await fn();
      } catch (err) {
        last = err;
        this.logger.warn(
          `${label} attempt ${i}/${this.maxRetries} failed: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
        if (i < this.maxRetries) {
          await new Promise((r) => setTimeout(r, 250 * i));
        }
      }
    }
    throw last;
  }

  async getStatus(chain: SupportedChain) {
    const rpcUrl = this.getRpcUrl(chain);
    if (chain === 'solana') {
      const conn = this.getSolana();
      const [slot, version] = await this.withRetry(`solana.status`, () =>
        Promise.all([conn.getSlot('confirmed'), conn.getVersion()]),
      );
      return {
        chain,
        family: 'solana' as const,
        rpcUrl,
        healthy: true,
        slot,
        version: version['solana-core'],
      };
    }
    const provider = this.getEvmProvider(chain);
    const [blockNumber, network] = await this.withRetry(`${chain}.status`, () =>
      Promise.all([provider.getBlockNumber(), provider.getNetwork()]),
    );
    return {
      chain,
      family: 'evm' as const,
      rpcUrl,
      healthy: true,
      blockNumber,
      chainId: Number(network.chainId),
      configuredChainId: this.getEvmChainId(chain),
    };
  }
}

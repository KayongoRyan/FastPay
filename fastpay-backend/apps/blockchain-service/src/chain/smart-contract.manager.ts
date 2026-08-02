import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PublicKey } from '@solana/web3.js';
import { Contract, Interface, Result } from 'ethers';

import type { SupportedChain } from '../config/chains.config';
import { NodeRpcManager } from './node-rpc.manager';

function serializeResult(value: unknown): unknown {
  if (typeof value === 'bigint') return value.toString();
  if (Array.isArray(value)) {
    const arr = value.map(serializeResult);
    if (value && typeof value === 'object' && 'toObject' in (value as object)) {
      try {
        return serializeResult((value as Result).toObject());
      } catch {
        return arr;
      }
    }
    return arr;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (!Number.isNaN(Number(k))) continue;
      out[k] = serializeResult(v);
    }
    return Object.keys(out).length ? out : serializeResult(Object.values(value));
  }
  return value;
}

@Injectable()
export class SmartContractManager {
  private readonly logger = new Logger(SmartContractManager.name);

  constructor(private readonly rpc: NodeRpcManager) {}

  encode(abi: unknown[], method: string, args: unknown[] = []) {
    try {
      const iface = new Interface(abi as never[]);
      const data = iface.encodeFunctionData(method, args);
      return { data, method, selector: data.slice(0, 10) };
    } catch (err) {
      throw new BadRequestException(
        `encode failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  decode(abi: unknown[], method: string, data: string) {
    try {
      const iface = new Interface(abi as never[]);
      const result = iface.decodeFunctionResult(method, data);
      return { method, result: serializeResult(result) };
    } catch (err) {
      throw new BadRequestException(
        `decode failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async call(params: {
    chain: SupportedChain;
    address: string;
    abi: unknown[];
    method: string;
    args?: unknown[];
    from?: string;
  }) {
    if (params.chain === 'solana') {
      return this.readSolanaAccount(params.address);
    }

    const provider = this.rpc.getEvmProvider(params.chain);
    const contract = new Contract(
      params.address,
      params.abi as never[],
      provider,
    );
    const fn = contract.getFunction(params.method);
    if (!fn) {
      throw new BadRequestException(`Method ${params.method} not in ABI`);
    }

    try {
      const raw = await this.rpc.withRetry(
        `${params.chain}.call.${params.method}`,
        () => fn.staticCall(...(params.args ?? []), {
          ...(params.from ? { from: params.from } : {}),
        }),
      );
      this.logger.debug(`call ${params.chain} ${params.address}.${params.method}`);
      return {
        chain: params.chain,
        address: params.address,
        method: params.method,
        result: serializeResult(raw),
      };
    } catch (err) {
      throw new BadRequestException(
        `contract call failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  private async readSolanaAccount(address: string) {
    let pubkey: PublicKey;
    try {
      pubkey = new PublicKey(address);
    } catch {
      throw new BadRequestException('Invalid Solana address');
    }
    const conn = this.rpc.getSolana();
    const info = await this.rpc.withRetry('solana.account', () =>
      conn.getAccountInfo(pubkey, 'confirmed'),
    );
    if (!info) {
      return {
        chain: 'solana' as const,
        address,
        exists: false,
        result: null,
      };
    }
    return {
      chain: 'solana' as const,
      address,
      exists: true,
      result: {
        lamports: info.lamports,
        owner: info.owner.toBase58(),
        executable: info.executable,
        dataLength: info.data.length,
        dataBase64: Buffer.from(info.data).toString('base64').slice(0, 256),
        note: 'Solana programs use IDL/Anchor — use encode/call for EVM ABIs',
      },
    };
  }
}

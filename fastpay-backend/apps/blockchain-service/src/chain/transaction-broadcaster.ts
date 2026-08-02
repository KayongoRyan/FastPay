import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Transaction } from '@solana/web3.js';
import { TransactionReceipt } from 'ethers';

import type { SupportedChain } from '../config/chains.config';
import { NodeRpcManager } from './node-rpc.manager';

@Injectable()
export class TransactionBroadcaster {
  private readonly logger = new Logger(TransactionBroadcaster.name);

  constructor(private readonly rpc: NodeRpcManager) {}

  async broadcast(chain: SupportedChain, signedTx: string) {
    if (chain === 'solana') {
      return this.broadcastSolana(signedTx);
    }
    return this.broadcastEvm(chain, signedTx);
  }

  async getStatus(chain: SupportedChain, hash: string) {
    if (chain === 'solana') {
      const conn = this.rpc.getSolana();
      const status = await this.rpc.withRetry(`solana.tx.${hash}`, () =>
        conn.getSignatureStatuses([hash], { searchTransactionHistory: true }),
      );
      const entry = status?.value?.[0];
      return {
        chain,
        hash,
        found: !!entry,
        confirmationStatus: entry?.confirmationStatus ?? null,
        err: entry?.err ?? null,
        slot: entry?.slot ?? null,
      };
    }

    const provider = this.rpc.getEvmProvider(chain);
    const [tx, receipt] = await this.rpc.withRetry(`${chain}.tx.${hash}`, () =>
      Promise.all([
        provider.getTransaction(hash),
        provider.getTransactionReceipt(hash),
      ]),
    );

    return {
      chain,
      hash,
      found: !!tx,
      pending: !!tx && !receipt,
      blockNumber: receipt?.blockNumber ?? null,
      status: receipt ? (receipt.status === 1 ? 'success' : 'reverted') : null,
      gasUsed: receipt ? receipt.gasUsed.toString() : null,
      from: tx?.from ?? receipt?.from ?? null,
      to: tx?.to ?? receipt?.to ?? null,
    };
  }

  private async broadcastEvm(chain: Exclude<SupportedChain, 'solana'>, signedTx: string) {
    if (!signedTx.startsWith('0x')) {
      throw new BadRequestException('EVM signedTx must be 0x-prefixed hex');
    }
    const provider = this.rpc.getEvmProvider(chain);
    const response = await this.rpc.withRetry(`${chain}.broadcast`, () =>
      provider.broadcastTransaction(signedTx),
    );
    this.logger.log(`Broadcast ${chain} tx ${response.hash}`);
    return {
      chain,
      hash: response.hash,
      from: response.from,
      to: response.to,
      nonce: response.nonce,
      family: 'evm' as const,
    };
  }

  private async broadcastSolana(signedTx: string) {
    let raw: Buffer;
    try {
      raw = Buffer.from(signedTx, 'base64');
      Transaction.from(raw); // validate
    } catch {
      throw new BadRequestException('Solana signedTx must be base64-encoded signed transaction');
    }
    const conn = this.rpc.getSolana();
    const signature = await this.rpc.withRetry('solana.broadcast', () =>
      conn.sendRawTransaction(raw, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      }),
    );
    this.logger.log(`Broadcast solana tx ${signature}`);
    return {
      chain: 'solana' as const,
      hash: signature,
      family: 'solana' as const,
    };
  }

  /** Wait for EVM receipt (optional helper for callers). */
  async waitEvmReceipt(
    chain: Exclude<SupportedChain, 'solana'>,
    hash: string,
    confirmations = 1,
  ): Promise<TransactionReceipt | null> {
    const provider = this.rpc.getEvmProvider(chain);
    return provider.waitForTransaction(hash, confirmations);
  }
}

import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PublicKey } from '@solana/web3.js';
import { id as ethId, type Filter } from 'ethers';
import { randomUUID } from 'crypto';

import type { SupportedChain } from '../config/chains.config';
import { NodeRpcManager } from './node-rpc.manager';

export type CapturedEvent = {
  id: string;
  chain: SupportedChain;
  at: string;
  blockNumber?: number | null;
  slot?: number | null;
  txHash?: string | null;
  address?: string | null;
  topics?: string[];
  data?: string | null;
  raw?: unknown;
};

type Subscription = {
  id: string;
  chain: SupportedChain;
  address?: string;
  topics?: string[];
  maxEvents: number;
  events: CapturedEvent[];
  createdAt: string;
  pollTimer?: ReturnType<typeof setInterval>;
  solanaSubId?: number;
  lastEvmBlock?: number;
};

@Injectable()
export class EventListenerService implements OnModuleDestroy {
  private readonly logger = new Logger(EventListenerService.name);
  private readonly subs = new Map<string, Subscription>();
  private readonly pollMs: number;

  constructor(
    private readonly rpc: NodeRpcManager,
    private readonly config: ConfigService,
  ) {
    this.pollMs = this.config.get<number>('chains.eventPollMs') ?? 12_000;
  }

  onModuleDestroy() {
    for (const id of [...this.subs.keys()]) {
      void this.unsubscribe(id);
    }
  }

  async subscribe(params: {
    chain: SupportedChain;
    address?: string;
    topics?: string[];
    maxEvents?: number;
    poll?: boolean;
  }) {
    const id = randomUUID();
    const sub: Subscription = {
      id,
      chain: params.chain,
      address: params.address,
      topics: params.topics,
      maxEvents: params.maxEvents ?? 100,
      events: [],
      createdAt: new Date().toISOString(),
    };

    if (params.chain === 'solana') {
      await this.startSolana(sub);
    } else {
      await this.startEvm(sub, params.poll !== false);
    }

    this.subs.set(id, sub);
    this.logger.log(`Subscribed ${id} on ${params.chain}`);
    return {
      subscriptionId: id,
      chain: params.chain,
      address: params.address ?? null,
      topics: params.topics ?? [],
      createdAt: sub.createdAt,
    };
  }

  getEvents(subscriptionId: string) {
    const sub = this.subs.get(subscriptionId);
    if (!sub) throw new NotFoundException(`Subscription ${subscriptionId} not found`);
    return {
      subscriptionId: sub.id,
      chain: sub.chain,
      count: sub.events.length,
      events: [...sub.events],
    };
  }

  async unsubscribe(subscriptionId: string) {
    const sub = this.subs.get(subscriptionId);
    if (!sub) throw new NotFoundException(`Subscription ${subscriptionId} not found`);

    if (sub.pollTimer) clearInterval(sub.pollTimer);
    if (sub.solanaSubId != null && sub.chain === 'solana') {
      try {
        await this.rpc.getSolana().removeOnLogsListener(sub.solanaSubId);
      } catch {
        /* ignore */
      }
    }
    this.subs.delete(subscriptionId);
    return { unsubscribed: true, subscriptionId };
  }

  private push(sub: Subscription, event: Omit<CapturedEvent, 'id' | 'at'>) {
    sub.events.unshift({
      ...event,
      id: randomUUID(),
      at: new Date().toISOString(),
    });
    if (sub.events.length > sub.maxEvents) {
      sub.events.length = sub.maxEvents;
    }
  }

  private normalizeTopics(topics?: string[]): (string | null)[] | undefined {
    if (!topics?.length) return undefined;
    return topics.map((t) => {
      if (!t) return null;
      if (t.startsWith('0x') && t.length === 66) return t;
      try {
        return ethId(t);
      } catch {
        return t;
      }
    });
  }

  private async startEvm(sub: Subscription, poll: boolean) {
    const provider = this.rpc.getEvmProvider(sub.chain as Exclude<SupportedChain, 'solana'>);
    const block = await provider.getBlockNumber();
    sub.lastEvmBlock = block;

    const filter: Filter = {
      address: sub.address,
      topics: this.normalizeTopics(sub.topics) as Filter['topics'],
    };

    const tick = async () => {
      try {
        const fromBlock = (sub.lastEvmBlock ?? block) + 1;
        const toBlock = await provider.getBlockNumber();
        if (toBlock < fromBlock) return;
        const logs = await provider.getLogs({
          ...filter,
          fromBlock,
          toBlock,
        });
        sub.lastEvmBlock = toBlock;
        for (const log of logs) {
          this.push(sub, {
            chain: sub.chain,
            blockNumber: log.blockNumber,
            txHash: log.transactionHash,
            address: log.address,
            topics: [...log.topics],
            data: log.data,
          });
        }
      } catch (err) {
        this.logger.warn(
          `EVM poll ${sub.id}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    };

    if (poll) {
      sub.pollTimer = setInterval(() => void tick(), this.pollMs);
      void tick();
    }
  }

  private async startSolana(sub: Subscription) {
    const conn = this.rpc.getSolana();
    const mentions = sub.address
      ? [new PublicKey(sub.address)]
      : undefined;

    sub.solanaSubId = conn.onLogs(
      mentions ? mentions[0]! : 'all',
      (logs, ctx) => {
        this.push(sub, {
          chain: 'solana',
          slot: ctx.slot,
          txHash: logs.signature,
          address: sub.address ?? null,
          data: logs.logs?.slice(0, 5).join('\n') ?? null,
          raw: { err: logs.err },
        });
      },
      'confirmed',
    );
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from '@nestjs/common';

import {
  SUPPORTED_CHAINS,
  type SupportedChain,
} from '../config/chains.config';
import {
  BroadcastTxDto,
  ContractCallDto,
  EncodeContractDto,
  GasEstimateDto,
  SubscribeEventsDto,
} from './dto/chain.dto';
import { EventListenerService } from './event-listener.service';
import { GasOptimizerService } from './gas-optimizer.service';
import { NodeRpcManager } from './node-rpc.manager';
import { SmartContractManager } from './smart-contract.manager';
import { TransactionBroadcaster } from './transaction-broadcaster';

@Controller('blockchain')
export class ChainController {
  constructor(
    private readonly rpc: NodeRpcManager,
    private readonly broadcaster: TransactionBroadcaster,
    private readonly contracts: SmartContractManager,
    private readonly events: EventListenerService,
    private readonly gas: GasOptimizerService,
  ) {}

  @Get('chains')
  listChains() {
    return {
      chains: SUPPORTED_CHAINS,
      stellar: true,
      note: 'Stellar remains on /stellar/*; EVM + Solana on /blockchain/*',
      components: [
        'NodeRpcManager',
        'TransactionBroadcaster',
        'SmartContractManager',
        'EventListener',
        'GasOptimizer',
      ],
    };
  }

  @Get('rpc/:chain/status')
  rpcStatus(@Param('chain') chain: string) {
    return this.rpc.getStatus(this.rpc.assertSupported(chain));
  }

  @Post('broadcast')
  broadcast(@Body() dto: BroadcastTxDto) {
    return this.broadcaster.broadcast(dto.chain, dto.signedTx);
  }

  @Get('tx/:chain/:hash')
  txStatus(
    @Param('chain') chain: string,
    @Param('hash') hash: string,
  ) {
    return this.broadcaster.getStatus(
      this.rpc.assertSupported(chain),
      hash,
    );
  }

  @Post('contracts/call')
  contractCall(@Body() dto: ContractCallDto) {
    return this.contracts.call({
      chain: dto.chain,
      address: dto.address,
      abi: dto.abi,
      method: dto.method,
      args: dto.args,
      from: dto.from,
    });
  }

  @Post('contracts/encode')
  contractEncode(@Body() dto: EncodeContractDto) {
    return this.contracts.encode(dto.abi, dto.method, dto.args ?? []);
  }

  @Post('events/subscribe')
  subscribe(@Body() dto: SubscribeEventsDto) {
    return this.events.subscribe({
      chain: dto.filter.chain,
      address: dto.filter.address,
      topics: dto.filter.topics,
      maxEvents: dto.maxEvents,
      poll: dto.filter.poll,
    });
  }

  @Get('events/:subscriptionId')
  getEvents(@Param('subscriptionId') subscriptionId: string) {
    return this.events.getEvents(subscriptionId);
  }

  @Delete('events/:subscriptionId')
  unsubscribe(@Param('subscriptionId') subscriptionId: string) {
    return this.events.unsubscribe(subscriptionId);
  }

  @Post('gas/estimate')
  gasEstimate(@Body() dto: GasEstimateDto) {
    return this.gas.estimate({
      chain: dto.chain,
      from: dto.from,
      to: dto.to,
      data: dto.data,
      value: dto.value,
      priority: dto.priority,
    });
  }

  @Get('gas/:chain')
  gasSuggest(@Param('chain') chain: string) {
    return this.gas.suggest(this.rpc.assertSupported(chain) as SupportedChain);
  }
}

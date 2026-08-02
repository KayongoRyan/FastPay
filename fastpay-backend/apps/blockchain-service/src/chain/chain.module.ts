import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import chainsConfig from '../config/chains.config';
import { ChainController } from './chain.controller';
import { EventListenerService } from './event-listener.service';
import { GasOptimizerService } from './gas-optimizer.service';
import { NodeRpcManager } from './node-rpc.manager';
import { SmartContractManager } from './smart-contract.manager';
import { TransactionBroadcaster } from './transaction-broadcaster';

@Module({
  imports: [ConfigModule.forFeature(chainsConfig)],
  controllers: [ChainController],
  providers: [
    NodeRpcManager,
    TransactionBroadcaster,
    SmartContractManager,
    EventListenerService,
    GasOptimizerService,
  ],
  exports: [
    NodeRpcManager,
    TransactionBroadcaster,
    SmartContractManager,
    EventListenerService,
    GasOptimizerService,
  ],
})
export class ChainModule {}

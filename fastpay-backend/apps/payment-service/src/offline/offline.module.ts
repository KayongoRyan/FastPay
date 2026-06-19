import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import offlineConfig from '../config/offline.config';
import servicesConfig from '../config/services.config';
import stellarConfig from '../config/stellar.config';
import { BlockchainClient } from '../clients/blockchain.client';
import { FraudClient } from '../clients/fraud.client';
import { OfflineRelay, OfflineRelaySchema, Transaction, TransactionSchema } from '@fastpay/schemas';
import { OfflineController } from './offline.controller';
import { OfflineProcessor } from './offline.processor';
import { OfflineService } from './offline.service';

@Module({
  imports: [
    ConfigModule.forFeature(offlineConfig),
    ConfigModule.forFeature(servicesConfig),
    ConfigModule.forFeature(stellarConfig),
    MongooseModule.forFeature([
      { name: OfflineRelay.name, schema: OfflineRelaySchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    BullModule.registerQueue({ name: 'offline-tx' }),
  ],
  controllers: [OfflineController],
  providers: [OfflineService, OfflineProcessor, BlockchainClient, FraudClient],
})
export class OfflineModule {}

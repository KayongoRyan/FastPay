import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { FastpayAuthModule } from '@fastpay/common';
import {
  AuditLog,
  AuditLogSchema,
  OfflineRelay,
  OfflineRelaySchema,
  Transaction,
  TransactionSchema,
  Wallet,
  WalletSchema,
} from '@fastpay/schemas';

import authConfig from '../config/auth.config';
import { PaymentAuditService } from '../audit/payment-audit.service';
import offlineConfig from '../config/offline.config';
import servicesConfig from '../config/services.config';
import stellarConfig from '../config/stellar.config';
import { BlockchainClient } from '../clients/blockchain.client';
import { FraudClient } from '../clients/fraud.client';
import { OfflineController } from './offline.controller';
import { OfflineProcessor } from './offline.processor';
import { OfflineService } from './offline.service';

const inlineOfflineQueue = process.env.FASTPAY_INLINE_OFFLINE_QUEUE === 'true';

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
    ConfigModule.forFeature(offlineConfig),
    ConfigModule.forFeature(servicesConfig),
    ConfigModule.forFeature(stellarConfig),
    FastpayAuthModule,
    MongooseModule.forFeature([
      { name: OfflineRelay.name, schema: OfflineRelaySchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
    ...(inlineOfflineQueue
      ? []
      : [BullModule.registerQueue({ name: 'offline-tx' })]),
  ],
  controllers: [OfflineController],
  providers: [
    OfflineService,
    BlockchainClient,
    FraudClient,
    PaymentAuditService,
    ...(inlineOfflineQueue ? [] : [OfflineProcessor]),
  ],
})
export class OfflineModule {}

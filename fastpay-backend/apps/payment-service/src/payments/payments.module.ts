import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { FastpayAuthModule } from '@fastpay/common';

import { OfflineRelay, OfflineRelaySchema, Wallet, WalletSchema } from '@fastpay/schemas';

import authConfig from '../config/auth.config';
import { PaymentHistoryGuard } from '../auth/payment-history.guard';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
    FastpayAuthModule,
    MongooseModule.forFeature([
      { name: OfflineRelay.name, schema: OfflineRelaySchema },
      { name: Wallet.name, schema: WalletSchema },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentHistoryGuard],
})
export class PaymentsModule {}

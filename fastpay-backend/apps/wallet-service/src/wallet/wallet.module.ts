import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { Wallet, WalletSchema } from '@fastpay/schemas';

import authConfig from '../config/auth.config';
import servicesConfig from '../config/services.config';
import walletConfig from '../config/wallet.config';
import { BlockchainClient } from '../clients/blockchain.client';
import { PaymentClient } from '../clients/payment.client';
import { InternalWalletController, WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
    ConfigModule.forFeature(servicesConfig),
    ConfigModule.forFeature(walletConfig),
    MongooseModule.forFeature([{ name: Wallet.name, schema: WalletSchema }]),
  ],
  controllers: [WalletController, InternalWalletController],
  providers: [WalletService, BlockchainClient, PaymentClient],
  exports: [WalletService],
})
export class WalletModule {}

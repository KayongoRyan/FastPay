import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { createHealthController, FastpayAuthModule } from '@fastpay/common';
import { FastpayMongoModule } from '@fastpay/mongo';
import { Wallet, WalletSchema } from '@fastpay/schemas';

import authConfig from './config/auth.config';
import { WalletModule } from './wallet/wallet.module';

const HealthController = createHealthController('wallet-service');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig],
      envFilePath: ['.env', '../../.env'],
    }),
    FastpayAuthModule,
    FastpayMongoModule.forRoot(),
    MongooseModule.forFeature([{ name: Wallet.name, schema: WalletSchema }]),
    WalletModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

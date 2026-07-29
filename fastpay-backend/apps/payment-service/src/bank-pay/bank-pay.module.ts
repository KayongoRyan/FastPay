import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FastpayAuthModule } from '@fastpay/common';

import servicesConfig from '../config/services.config';
import { MerchantClient } from '../clients/merchant.client';
import { WalletClient } from '../clients/wallet.client';
import { BankPayController } from './bank-pay.controller';
import { BankPayService } from './bank-pay.service';

@Module({
  imports: [ConfigModule.forFeature(servicesConfig), FastpayAuthModule],
  controllers: [BankPayController],
  providers: [BankPayService, MerchantClient, WalletClient],
})
export class BankPayModule {}

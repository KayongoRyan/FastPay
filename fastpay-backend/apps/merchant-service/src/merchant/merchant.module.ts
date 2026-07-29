import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { FastpayAuthModule } from '@fastpay/common';
import {
  MerchantInvoice,
  MerchantInvoiceSchema,
  MerchantOrg,
  MerchantOrgSchema,
  MerchantTransaction,
  MerchantTransactionSchema,
} from '@fastpay/schemas';

import authConfig from '../config/auth.config';
import merchantConfig from '../config/merchant.config';
import { InternalMerchantController, MerchantController } from './merchant.controller';
import { MerchantInvoiceService } from './merchant-invoice.service';
import { MerchantOrgService } from './merchant-org.service';

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
    ConfigModule.forFeature(merchantConfig),
    FastpayAuthModule,
    MongooseModule.forFeature([
      { name: MerchantOrg.name, schema: MerchantOrgSchema },
      { name: MerchantInvoice.name, schema: MerchantInvoiceSchema },
      { name: MerchantTransaction.name, schema: MerchantTransactionSchema },
    ]),
  ],
  controllers: [MerchantController, InternalMerchantController],
  providers: [MerchantOrgService, MerchantInvoiceService],
  exports: [MerchantOrgService, MerchantInvoiceService],
})
export class MerchantModule {}

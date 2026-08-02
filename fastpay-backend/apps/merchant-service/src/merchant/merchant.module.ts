import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { FastpayAuthModule } from '@fastpay/common';
import {
  MerchantEmployee,
  MerchantEmployeeSchema,
  MerchantGoal,
  MerchantGoalSchema,
  MerchantInvoice,
  MerchantInvoiceSchema,
  MerchantOrder,
  MerchantOrderSchema,
  MerchantOrg,
  MerchantOrgSchema,
  MerchantPayrollEntry,
  MerchantPayrollEntrySchema,
  MerchantProduct,
  MerchantProductSchema,
  MerchantStockMovement,
  MerchantStockMovementSchema,
  MerchantTransaction,
  MerchantTransactionSchema,
} from '@fastpay/schemas';

import authConfig from '../config/auth.config';
import merchantConfig from '../config/merchant.config';
import { InternalMerchantController, MerchantController } from './merchant.controller';
import { MerchantGoalsService } from './merchant-goals.service';
import { MerchantHrService } from './merchant-hr.service';
import { MerchantInventoryService } from './merchant-inventory.service';
import { MerchantInvoiceService } from './merchant-invoice.service';
import { MerchantOrderService } from './merchant-order.service';
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
      { name: MerchantProduct.name, schema: MerchantProductSchema },
      { name: MerchantStockMovement.name, schema: MerchantStockMovementSchema },
      { name: MerchantEmployee.name, schema: MerchantEmployeeSchema },
      { name: MerchantPayrollEntry.name, schema: MerchantPayrollEntrySchema },
      { name: MerchantGoal.name, schema: MerchantGoalSchema },
      { name: MerchantOrder.name, schema: MerchantOrderSchema },
    ]),
  ],
  controllers: [MerchantController, InternalMerchantController],
  providers: [
    MerchantOrgService,
    MerchantInvoiceService,
    MerchantInventoryService,
    MerchantHrService,
    MerchantGoalsService,
    MerchantOrderService,
  ],
  exports: [
    MerchantOrgService,
    MerchantInvoiceService,
    MerchantInventoryService,
    MerchantHrService,
    MerchantGoalsService,
    MerchantOrderService,
  ],
})
export class MerchantModule {}

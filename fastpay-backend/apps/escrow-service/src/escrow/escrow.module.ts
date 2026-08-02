import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { FastpayAuthModule } from '@fastpay/common';
import { EscrowContract, EscrowContractSchema } from '@fastpay/schemas';

import authConfig from '../config/auth.config';
import servicesConfig from '../config/services.config';
import {
  EscrowController,
  InternalEscrowController,
} from './escrow.controller';
import { EscrowService } from './escrow.service';
import { MerchantBridgeClient } from './merchant-bridge.client';

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
    ConfigModule.forFeature(servicesConfig),
    FastpayAuthModule,
    MongooseModule.forFeature([
      { name: EscrowContract.name, schema: EscrowContractSchema },
    ]),
  ],
  controllers: [EscrowController, InternalEscrowController],
  providers: [EscrowService, MerchantBridgeClient],
  exports: [EscrowService],
})
export class EscrowModule {}

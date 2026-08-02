import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { FastpayAuthModule } from '@fastpay/common';
import {
  BusinessMember,
  BusinessMemberSchema,
  BusinessOrg,
  BusinessOrgSchema,
} from '@fastpay/schemas';

import authConfig from '../config/auth.config';
import businessConfig from '../config/business.config';
import {
  BusinessController,
  InternalBusinessController,
} from './business.controller';
import { BusinessOrgService } from './business-org.service';
import { MerchantBridgeClient } from './merchant-bridge.client';

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
    ConfigModule.forFeature(businessConfig),
    FastpayAuthModule,
    MongooseModule.forFeature([
      { name: BusinessOrg.name, schema: BusinessOrgSchema },
      { name: BusinessMember.name, schema: BusinessMemberSchema },
    ]),
  ],
  controllers: [BusinessController, InternalBusinessController],
  providers: [BusinessOrgService, MerchantBridgeClient],
  exports: [BusinessOrgService],
})
export class BusinessModule {}

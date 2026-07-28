import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FastpayAuthModule } from '@fastpay/common';

import authConfig from '../config/auth.config';

@Global()
@Module({
  imports: [ConfigModule.forFeature(authConfig), FastpayAuthModule],
  exports: [FastpayAuthModule],
})
export class PaymentAuthModule {}

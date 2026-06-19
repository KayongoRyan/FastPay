import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { createHealthController } from '@fastpay/common';
import { FastpayMongoModule } from '@fastpay/mongo';

import { AuthModule } from './auth/auth.module';

const HealthController = createHealthController('auth-service');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
    FastpayMongoModule.forRoot(),
    AuthModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

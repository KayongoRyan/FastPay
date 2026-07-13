import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { createHealthController } from '@fastpay/common';
import { FastpayMongoModule } from '@fastpay/mongo';
import { AuditLog, AuditLogSchema } from '@fastpay/schemas';

import authConfig from './config/auth.config';
import { SecurityModule } from './security/security.module';

const HealthController = createHealthController('audit-service');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig],
      envFilePath: ['.env', '../../.env'],
    }),
    FastpayMongoModule.forRoot(),
    MongooseModule.forFeature([{ name: AuditLog.name, schema: AuditLogSchema }]),
    SecurityModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

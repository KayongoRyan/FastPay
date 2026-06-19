import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { createHealthController } from '@fastpay/common';
import { FastpayMongoModule } from '@fastpay/mongo';
import { KycDocument, KycDocumentSchema } from '@fastpay/schemas';

const HealthController = createHealthController('kyc-service');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
    FastpayMongoModule.forRoot(),
    MongooseModule.forFeature([{ name: KycDocument.name, schema: KycDocumentSchema }]),
  ],
  controllers: [HealthController],
})
export class AppModule {}

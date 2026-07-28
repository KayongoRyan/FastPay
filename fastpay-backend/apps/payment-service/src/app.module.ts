import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { createHealthController } from '@fastpay/common';
import { FastpayMongoModule } from '@fastpay/mongo';

import authConfig from './config/auth.config';
import offlineConfig from './config/offline.config';
import servicesConfig from './config/services.config';
import stellarConfig from './config/stellar.config';
import { OfflineModule } from './offline/offline.module';
import { PaymentsModule } from './payments/payments.module';
import { MomoModule } from './momo/momo.module';

const HealthController = createHealthController('payment-service');
const inlineOfflineQueue = process.env.FASTPAY_INLINE_OFFLINE_QUEUE === 'true';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig, offlineConfig, servicesConfig, stellarConfig],
      envFilePath: ['.env', '../../.env'],
    }),
    FastpayMongoModule.forRoot(),
    ...(inlineOfflineQueue
      ? []
      : [
          BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
              connection: {
                host: configService.getOrThrow<string>('offline.redisHost'),
                port: configService.getOrThrow<number>('offline.redisPort'),
                maxRetriesPerRequest: null,
              },
            }),
          }),
        ]),
    OfflineModule,
    PaymentsModule,
    MomoModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

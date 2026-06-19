import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { createHealthController } from '@fastpay/common';
import { FastpayMongoModule } from '@fastpay/mongo';

import offlineConfig from './config/offline.config';
import servicesConfig from './config/services.config';
import stellarConfig from './config/stellar.config';
import { OfflineModule } from './offline/offline.module';

const HealthController = createHealthController('payment-service');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [offlineConfig, servicesConfig, stellarConfig],
      envFilePath: ['.env', '../../.env'],
    }),
    FastpayMongoModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.getOrThrow<string>('offline.redisHost'),
          port: configService.getOrThrow<number>('offline.redisPort'),
        },
      }),
    }),
    OfflineModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

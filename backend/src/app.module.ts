import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import offlineConfig from './config/offline.config';
import stellarConfig from './config/stellar.config';
import { OfflineModule } from './offline/offline.module';
import { StellarModule } from './stellar/stellar.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [stellarConfig, offlineConfig],
      envFilePath: ['.env'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('offline.mongodbUri'),
      }),
    }),
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
    StellarModule,
    OfflineModule,
  ],
})
export class AppModule {}

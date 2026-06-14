import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import offlineConfig from '../config/offline.config';
import { StellarModule } from '../stellar/stellar.module';
import { OfflineController } from './offline.controller';
import { OfflineProcessor } from './offline.processor';
import { OfflineRelay, OfflineRelaySchema } from './offline.schema';
import { OfflineService } from './offline.service';

@Module({
  imports: [
    ConfigModule.forFeature(offlineConfig),
    MongooseModule.forFeature([
      { name: OfflineRelay.name, schema: OfflineRelaySchema },
    ]),
    BullModule.registerQueue({
      name: 'offline-tx',
    }),
    StellarModule,
  ],
  controllers: [OfflineController],
  providers: [OfflineService, OfflineProcessor],
  exports: [OfflineService],
})
export class OfflineModule {}

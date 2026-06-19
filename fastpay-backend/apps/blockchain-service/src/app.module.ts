import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { createHealthController } from '@fastpay/common';

import stellarConfig from './config/stellar.config';
import { StellarModule } from './stellar/stellar.module';

const HealthController = createHealthController('blockchain-service');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [stellarConfig],
      envFilePath: ['.env', '../../.env'],
    }),
    StellarModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

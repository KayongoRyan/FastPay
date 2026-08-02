import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { createHealthController } from '@fastpay/common';

import { ChainModule } from './chain/chain.module';
import chainsConfig from './config/chains.config';
import stellarConfig from './config/stellar.config';
import { StellarModule } from './stellar/stellar.module';

const HealthController = createHealthController('blockchain-service');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [stellarConfig, chainsConfig],
      envFilePath: ['.env', '../../.env'],
    }),
    StellarModule,
    ChainModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

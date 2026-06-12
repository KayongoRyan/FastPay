import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import stellarConfig from './config/stellar.config';
import { StellarModule } from './stellar/stellar.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [stellarConfig],
      envFilePath: ['.env'],
    }),
    StellarModule,
  ],
})
export class AppModule {}

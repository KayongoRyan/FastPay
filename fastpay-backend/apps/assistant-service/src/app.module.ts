import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { createHealthController } from '@fastpay/common';
import { FastpayMongoModule } from '@fastpay/mongo';

import { AssistantModule } from './assistant/assistant.module';
import authConfig from './config/auth.config';
import assistantConfig from './config/assistant.config';

const HealthController = createHealthController('assistant-service');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig, assistantConfig],
      envFilePath: ['.env', '../../.env'],
    }),
    FastpayMongoModule.forRoot(),
    AssistantModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

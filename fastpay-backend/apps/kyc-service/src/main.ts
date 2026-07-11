import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'express';

import { ensureMongoUri } from '@fastpay/mongo';

import { AppModule } from './app.module';

async function bootstrap() {
  await ensureMongoUri('kyc-service');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });
  // ID/POA uploads are base64 JSON payloads — default 100kb limit returns 413.
  app.use(json({ limit: '15mb' }));
  app.use(urlencoded({ extended: true, limit: '15mb' }));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = process.env.KYC_SERVICE_PORT ?? 3012;
  await app.listen(port);
  console.log('kyc-service running on http://localhost:' + port);
}

bootstrap();

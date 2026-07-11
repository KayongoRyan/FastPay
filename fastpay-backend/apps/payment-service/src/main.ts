import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { ensureMongoUri } from '@fastpay/mongo';

import { ensureDevRedisMode } from './bootstrap-redis';

async function bootstrap() {
  await ensureMongoUri('payment-service');
  await ensureDevRedisMode('payment-service');

  const { AppModule } = await import('./app.module');
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = process.env.PAYMENT_SERVICE_PORT ?? 3003;
  await app.listen(port);
  console.log(`payment-service running on http://localhost:${port}`);
}

bootstrap();

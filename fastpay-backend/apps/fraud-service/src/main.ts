import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { ensureMongoUri } from '@fastpay/mongo';

import { AppModule } from './app.module';

async function bootstrap() {
  await ensureMongoUri('fraud-service');
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = process.env.FRAUD_SERVICE_PORT ?? 3011;
  await app.listen(port);
  console.log(`fraud-service running on http://localhost:${port}`);
}

bootstrap();

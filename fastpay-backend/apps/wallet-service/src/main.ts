import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { ensureMongoUri } from '@fastpay/mongo';

import { AppModule } from './app.module';

async function bootstrap() {
  await ensureMongoUri('wallet-service');
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = process.env.PORT ?? 3002;
  await app.listen(port);
  console.log('wallet-service running on http://localhost:' + port);
}

bootstrap();

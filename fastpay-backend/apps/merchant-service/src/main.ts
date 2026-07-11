import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { ensureMongoUri } from '@fastpay/mongo';

import { AppModule } from './app.module';

async function bootstrap() {
  await ensureMongoUri('merchant-service');
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = process.env.PORT ?? 3006;
  await app.listen(port);
  console.log('merchant-service running on http://localhost:' + port);
}

bootstrap();

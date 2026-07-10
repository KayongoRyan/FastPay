import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { ensureMongoUri } from './bootstrap-mongo';
import { AbortedRequestFilter } from './filters/aborted-request.filter';

async function bootstrap() {
  await ensureMongoUri();
  const app = await NestFactory.create(AppModule);
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AbortedRequestFilter(app.get(HttpAdapterHost)));
  const port = process.env.AUTH_SERVICE_PORT ?? 3001;
  await app.listen(port);
  console.log('auth-service running on http://localhost:' + port);
}

bootstrap();

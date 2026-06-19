import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = app.get(ConfigService);
  const routes = [
    { path: '/auth', target: config.get('gateway.authUrl') },
    { path: '/stellar', target: config.get('gateway.blockchainUrl') },
    { path: '/offline', target: config.get('gateway.paymentUrl') },
    { path: '/compliance', target: config.get('gateway.fraudUrl') },
  ];

  for (const route of routes) {
    app.use(
      route.path,
      createProxyMiddleware({
        target: route.target,
        changeOrigin: true,
      }),
    );
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`api-gateway running on http://localhost:${port}`);
}

bootstrap();

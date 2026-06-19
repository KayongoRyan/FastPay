const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const skip = new Set([
  'api-gateway',
  'payment-service',
  'blockchain-service',
  'fraud-service',
]);

const ports = {
  'auth-service': 3001,
  'wallet-service': 3002,
  'family-service': 3004,
  'escrow-service': 3005,
  'merchant-service': 3006,
  'treasury-service': 3007,
  'liquidity-service': 3008,
  'notification-service': 3010,
  'kyc-service': 3012,
  'insurance-service': 3013,
  'analytics-service': 3014,
  'audit-service': 3015,
};

for (const [name, port] of Object.entries(ports)) {
  if (skip.has(name)) continue;
  const pkg = `@fastpay/${name}`;
  const dir = path.join(root, 'apps', name);
  const src = path.join(dir, 'src');

  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify(
      {
        name: pkg,
        version: '1.0.0',
        private: true,
        scripts: {
          build: 'nest build',
          start: 'nest start',
          'start:dev': 'nest start --watch',
          'start:prod': 'node dist/main',
        },
        dependencies: {
          '@fastpay/common': '1.0.0',
          '@fastpay/mongo': '1.0.0',
          '@nestjs/common': '^11.0.0',
          '@nestjs/config': '^4.0.0',
          '@nestjs/core': '^11.0.0',
          '@nestjs/platform-express': '^11.0.0',
          'reflect-metadata': '^0.2.2',
          rxjs: '^7.8.1',
        },
      },
      null,
      2,
    ),
  );

  fs.writeFileSync(
    path.join(dir, 'tsconfig.json'),
    JSON.stringify(
      {
        extends: '../../tsconfig.base.json',
        compilerOptions: { outDir: './dist' },
        include: ['src/**/*'],
      },
      null,
      2,
    ),
  );

  fs.writeFileSync(
    path.join(dir, 'nest-cli.json'),
    JSON.stringify(
      { collection: '@nestjs/schematics', sourceRoot: 'src' },
      null,
      2,
    ),
  );

  const serviceLabel = name.replace(/-/g, ' ');

  fs.writeFileSync(
    path.join(src, 'main.ts'),
    `import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = process.env.PORT ?? ${port};
  await app.listen(port);
  console.log('${name} running on http://localhost:' + port);
}

bootstrap();
`,
  );

  fs.writeFileSync(
    path.join(src, 'app.module.ts'),
    `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { createHealthController } from '@fastpay/common';
import { FastpayMongoModule } from '@fastpay/mongo';

const HealthController = createHealthController('${name}');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
    FastpayMongoModule.forRoot(),
  ],
  controllers: [HealthController],
})
export class AppModule {}
`,
  );
}

console.log('Stub services scaffolded.');

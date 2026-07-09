import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = Number(process.env.GATEWAY_PORT ?? process.env.PORT ?? 3000);
  await app.listen(port);
  // #region agent log
  fetch('http://127.0.0.1:7374/ingest/e5785f1a-1397-4b7d-b3c8-78db776e0924',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'574f27'},body:JSON.stringify({sessionId:'574f27',runId:'verify-startup',hypothesisId:'H2-H3',location:'main.ts:bootstrap',message:'Gateway listening',data:{port},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  console.log(`api-gateway running on http://localhost:${port}`);
}

bootstrap();

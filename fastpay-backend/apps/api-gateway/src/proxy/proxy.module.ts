import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createProxyMiddleware } from 'http-proxy-middleware';
import type { RequestHandler } from 'http-proxy-middleware';

type GatewayRoute = {
  path: string;
  targetKey:
    | 'authUrl'
    | 'blockchainUrl'
    | 'paymentUrl'
    | 'fraudUrl'
    | 'kycUrl';
};

const ROUTES: GatewayRoute[] = [
  { path: 'auth', targetKey: 'authUrl' },
  { path: 'stellar', targetKey: 'blockchainUrl' },
  { path: 'offline', targetKey: 'paymentUrl' },
  { path: 'payments', targetKey: 'paymentUrl' },
  { path: 'momo', targetKey: 'paymentUrl' },
  { path: 'compliance', targetKey: 'fraudUrl' },
  { path: 'kyc', targetKey: 'kycUrl' },
];

function createRouteProxy(
  config: ConfigService,
  route: GatewayRoute,
): RequestHandler {
  const prefix = `/${route.path}`;
  const target = config.getOrThrow<string>(`gateway.${route.targetKey}`);

  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path) => {
      const pathname = path.split('?')[0] ?? path;
      return pathname.startsWith(prefix) ? pathname : `${prefix}${pathname}`;
    },
  });
}

@Module({})
export class ProxyModule implements NestModule {
  constructor(private readonly config: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    for (const route of ROUTES) {
      const exactPath = route.path;
      const wildcardPath = `${route.path}/*path`;
      // #region agent log
      fetch('http://127.0.0.1:7374/ingest/e5785f1a-1397-4b7d-b3c8-78db776e0924',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'574f27'},body:JSON.stringify({sessionId:'574f27',runId:'verify-startup',hypothesisId:'H1-H2',location:'proxy.module.ts:configure',message:'Registering proxy routes',data:{exactPath,wildcardPath,targetKey:route.targetKey},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      consumer
        .apply(createRouteProxy(this.config, route))
        .forRoutes(
          { path: exactPath, method: RequestMethod.ALL },
          { path: wildcardPath, method: RequestMethod.ALL },
        );
    }
    // #region agent log
    fetch('http://127.0.0.1:7374/ingest/e5785f1a-1397-4b7d-b3c8-78db776e0924',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'574f27'},body:JSON.stringify({sessionId:'574f27',runId:'verify-startup',hypothesisId:'H2',location:'proxy.module.ts:configure',message:'All proxy routes registered',data:{routeCount:ROUTES.length},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }
}

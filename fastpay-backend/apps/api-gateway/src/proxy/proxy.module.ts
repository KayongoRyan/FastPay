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
    | 'walletUrl'
    | 'paymentUrl'
    | 'familyUrl'
    | 'escrowUrl'
    | 'merchantUrl'
    | 'treasuryUrl'
    | 'blockchainUrl'
    | 'fraudUrl'
    | 'kycUrl';
};

const ROUTES: GatewayRoute[] = [
  { path: 'auth', targetKey: 'authUrl' },
  { path: 'wallet', targetKey: 'walletUrl' },
  { path: 'stellar', targetKey: 'blockchainUrl' },
  { path: 'offline', targetKey: 'paymentUrl' },
  { path: 'payments', targetKey: 'paymentUrl' },
  { path: 'momo', targetKey: 'paymentUrl' },
  { path: 'family', targetKey: 'familyUrl' },
  { path: 'escrow', targetKey: 'escrowUrl' },
  { path: 'merchant', targetKey: 'merchantUrl' },
  { path: 'treasury', targetKey: 'treasuryUrl' },
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
      consumer
        .apply(createRouteProxy(this.config, route))
        .forRoutes(
          { path: route.path, method: RequestMethod.ALL },
          { path: `${route.path}/*path`, method: RequestMethod.ALL },
        );
    }
  }
}

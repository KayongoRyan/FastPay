import { registerAs } from '@nestjs/config';

export default registerAs('services', () => ({
  walletUrl: process.env.WALLET_SERVICE_URL ?? 'http://localhost:3002',
  merchantUrl: process.env.MERCHANT_SERVICE_URL ?? 'http://localhost:3006',
  businessUrl: process.env.BUSINESS_SERVICE_URL ?? 'http://localhost:3008',
}));

import { registerAs } from '@nestjs/config';

export default registerAs('gateway', () => ({
  blockchainUrl:
    process.env.BLOCKCHAIN_SERVICE_URL ?? 'http://localhost:3009',
  paymentUrl: process.env.PAYMENT_SERVICE_URL ?? 'http://localhost:3003',
  fraudUrl: process.env.FRAUD_SERVICE_URL ?? 'http://localhost:3011',
  authUrl: process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001',
}));

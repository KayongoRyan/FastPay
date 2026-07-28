import { registerAs } from '@nestjs/config';

export default registerAs('services', () => ({
  blockchainUrl:
    process.env.BLOCKCHAIN_SERVICE_URL ?? 'http://localhost:3009',
  paymentUrl: process.env.PAYMENT_SERVICE_URL ?? 'http://localhost:3003',
}));

import { registerAs } from '@nestjs/config';

export default registerAs('services', () => ({
  blockchainUrl:
    process.env.BLOCKCHAIN_SERVICE_URL ?? 'http://localhost:3009',
  fraudUrl: process.env.FRAUD_SERVICE_URL ?? 'http://localhost:3011',
  merchantUrl: process.env.MERCHANT_SERVICE_URL ?? 'http://localhost:3006',
  walletUrl: process.env.WALLET_SERVICE_URL ?? 'http://localhost:3002',
}));

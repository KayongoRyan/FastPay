import { registerAs } from '@nestjs/config';

export default registerAs('services', () => ({
  blockchainUrl:
    process.env.BLOCKCHAIN_SERVICE_URL ?? 'http://localhost:3009',
  fraudUrl: process.env.FRAUD_SERVICE_URL ?? 'http://localhost:3011',
}));

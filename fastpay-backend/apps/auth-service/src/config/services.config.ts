import { registerAs } from '@nestjs/config';

export default registerAs('services', () => ({
  walletUrl: process.env.WALLET_SERVICE_URL ?? 'http://localhost:3002',
}));

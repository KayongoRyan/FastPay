import { registerAs } from '@nestjs/config';

export default registerAs('services', () => ({
  merchantUrl: process.env.MERCHANT_SERVICE_URL ?? 'http://localhost:3006',
}));

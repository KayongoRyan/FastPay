import { registerAs } from '@nestjs/config';

export default registerAs('business', () => ({
  merchantServiceUrl:
    process.env.MERCHANT_SERVICE_URL ?? 'http://localhost:3006',
}));

import { registerAs } from '@nestjs/config';

export default registerAs('merchant', () => ({
  settlementPublicKey:
    process.env.MERCHANT_SETTLEMENT_PUBLIC_KEY ??
    'GCKFBEIYTKPBJRAQDJQHEQUXHPIKUPZOIDFFQPCCVRFHTEYSAVP7SFXM',
}));

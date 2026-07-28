import { registerAs } from '@nestjs/config';

export default registerAs('wallet', () => ({
  rwfPerXlm: Number(process.env.WALLET_RWF_PER_XLM ?? 1420),
}));

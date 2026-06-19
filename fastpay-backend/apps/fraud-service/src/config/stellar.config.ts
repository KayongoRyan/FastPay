import { registerAs } from '@nestjs/config';
import { Networks } from '@stellar/stellar-sdk';

export default registerAs('stellar', () => ({
  horizonUrl:
    process.env.STELLAR_HORIZON_URL ?? 'https://horizon-testnet.stellar.org',
  networkPassphrase:
    process.env.STELLAR_NETWORK_PASSPHRASE ?? Networks.TESTNET,
  friendbotUrl:
    process.env.STELLAR_FRIENDBOT_URL ?? 'https://friendbot.stellar.org',
}));

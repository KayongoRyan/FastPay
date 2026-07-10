import { registerAs } from '@nestjs/config';

export default registerAs('gateway', () => ({
  authUrl: process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001',
  walletUrl: process.env.WALLET_SERVICE_URL ?? 'http://localhost:3002',
  paymentUrl: process.env.PAYMENT_SERVICE_URL ?? 'http://localhost:3003',
  familyUrl: process.env.FAMILY_SERVICE_URL ?? 'http://localhost:3004',
  escrowUrl: process.env.ESCROW_SERVICE_URL ?? 'http://localhost:3005',
  merchantUrl: process.env.MERCHANT_SERVICE_URL ?? 'http://localhost:3006',
  treasuryUrl: process.env.TREASURY_SERVICE_URL ?? 'http://localhost:3007',
  blockchainUrl:
    process.env.BLOCKCHAIN_SERVICE_URL ?? 'http://localhost:3009',
  fraudUrl: process.env.FRAUD_SERVICE_URL ?? 'http://localhost:3011',
  kycUrl: process.env.KYC_SERVICE_URL ?? 'http://localhost:3012',
}));

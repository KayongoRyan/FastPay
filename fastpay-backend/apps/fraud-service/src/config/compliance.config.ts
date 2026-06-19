import { registerAs } from '@nestjs/config';

export default registerAs('compliance', () => ({
  chainalysisMockUrl:
    process.env.CHAINALYSIS_MOCK_URL ??
    'http://localhost:3000/compliance/chainalysis',
  chainalysisApiKey: process.env.CHAINALYSIS_API_KEY ?? 'mock-api-key',
}));

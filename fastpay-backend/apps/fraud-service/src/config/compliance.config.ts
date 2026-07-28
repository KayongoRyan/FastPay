import { registerAs } from '@nestjs/config';

export default registerAs('compliance', () => ({
  chainalysisProvider: process.env.CHAINALYSIS_PROVIDER ?? 'mock',
  chainalysisMockUrl:
    process.env.CHAINALYSIS_MOCK_URL ??
    'http://localhost:3000/compliance/chainalysis',
  chainalysisHttpUrl: process.env.CHAINALYSIS_HTTP_URL ?? '',
  chainalysisApiKey: process.env.CHAINALYSIS_API_KEY ?? 'mock-api-key',
}));

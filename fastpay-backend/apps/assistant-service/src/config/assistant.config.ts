import { registerAs } from '@nestjs/config';

export default registerAs('assistant', () => ({
  openAiApiKey: process.env.OPENAI_API_KEY ?? '',
  embeddingModel: process.env.EMBEDDING_MODEL ?? 'text-embedding-3-small',
  llmModel: process.env.LLM_MODEL ?? 'gpt-4o-mini',
  llmProvider: process.env.LLM_PROVIDER ?? 'openai',
  topK: Number(process.env.ASSISTANT_TOP_K ?? 8),
  rateLimitPerHour: Number(process.env.ASSISTANT_RATE_LIMIT_PER_HOUR ?? 30),
  fallbackEnabled: process.env.ASSISTANT_FALLBACK_ENABLED !== 'false',
  indexRebuildSecret: process.env.ASSISTANT_INDEX_SECRET ?? 'dev-index-secret',
  paymentServiceUrl:
    process.env.PAYMENT_SERVICE_URL ?? 'http://localhost:3003',
  kycServiceUrl: process.env.KYC_SERVICE_URL ?? 'http://localhost:3012',
  localEmbeddingDims: Number(process.env.ASSISTANT_LOCAL_EMBEDDING_DIMS ?? 256),
}));

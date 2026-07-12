import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import {
  AuditLog,
  AuditLogSchema,
  ChatConversation,
  ChatConversationSchema,
  KnowledgeChunk,
  KnowledgeChunkSchema,
} from '@fastpay/schemas';

import authConfig from '../config/auth.config';
import assistantConfig from '../config/assistant.config';
import { JwtVerifierService } from '../auth/jwt-verifier.service';
import { ChatAuditService } from '../audit/chat-audit.service';
import { LlmService, PromptBuilderService } from '../generation/llm.service';
import {
  IndexerService,
  StaticCorpusParserService,
} from '../indexing/indexer.service';
import {
  UserSummaryJobService,
  UserSummarySchemas,
} from '../indexing/user-summary.job';
import { StartupIndexerService } from '../indexing/startup-indexer.service';
import { EmbedderService } from '../retrieval/embedder.service';
import { RetrieverService } from '../retrieval/retriever.service';
import { RateLimiterService } from '../security/rate-limiter.service';
import { ChatController } from '../chat/chat.controller';
import { ChatService } from '../chat/chat.service';

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
    ConfigModule.forFeature(assistantConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(authConfig)],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('auth.jwtAccessSecret'),
      }),
    }),
    MongooseModule.forFeature([
      { name: KnowledgeChunk.name, schema: KnowledgeChunkSchema },
      { name: ChatConversation.name, schema: ChatConversationSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      ...UserSummarySchemas,
    ]),
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    JwtVerifierService,
    EmbedderService,
    RetrieverService,
    PromptBuilderService,
    LlmService,
    StaticCorpusParserService,
    IndexerService,
    UserSummaryJobService,
    StartupIndexerService,
    RateLimiterService,
    ChatAuditService,
  ],
})
export class AssistantModule {}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  ChatConversation,
  ChatConversationDocument,
  KnowledgeChunk,
  KnowledgeChunkDocument,
  KnowledgeChunkScope,
} from '@fastpay/schemas';

import { ChatAuditService } from '../audit/chat-audit.service';
import { LlmService } from '../generation/llm.service';
import { IndexerService } from '../indexing/indexer.service';
import { UserSummaryJobService } from '../indexing/user-summary.job';
import { RetrieverService } from '../retrieval/retriever.service';
import { RateLimiterService } from '../security/rate-limiter.service';
import { ChatRequestDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly configService: ConfigService,
    private readonly retriever: RetrieverService,
    private readonly llm: LlmService,
    private readonly indexer: IndexerService,
    private readonly userSummaryJob: UserSummaryJobService,
    private readonly rateLimiter: RateLimiterService,
    private readonly chatAudit: ChatAuditService,
    @InjectModel(ChatConversation.name)
    private readonly conversationModel: Model<ChatConversationDocument>,
    @InjectModel(KnowledgeChunk.name)
    private readonly chunkModel: Model<KnowledgeChunkDocument>,
  ) {}

  async chat(userId: string, dto: ChatRequestDto, authorization?: string) {
    const started = Date.now();
    await this.rateLimiter.checkLimit(userId);

    await this.ensureUserIndex(userId, authorization);

    const topK = this.configService.getOrThrow<number>('assistant.topK');
    const chunks = await this.retriever.retrieve({
      query: dto.message,
      userId,
      topK,
      currentRoute: dto.context?.currentRoute,
      includeUserScope: true,
    });

    const llmResult = await this.llm.generate({
      message: dto.message,
      chunks,
      budgetSnapshot: dto.context?.budgetSnapshot,
      currentRoute: dto.context?.currentRoute,
    });

    const conversation = await this.persistConversation(
      userId,
      dto,
      llmResult.reply,
      llmResult.sources,
      llmResult.actions,
    );

    const model =
      this.configService.get<string>('assistant.openAiApiKey')
        ? this.configService.getOrThrow<string>('assistant.llmModel')
        : 'fallback-local';

    await this.chatAudit.logChatTurn({
      userId,
      message: dto.message,
      reply: llmResult.reply,
      chunkIds: chunks.map((chunk) => chunk.id),
      model,
      latencyMs: Date.now() - started,
      conversationId: String(conversation._id),
      currentRoute: dto.context?.currentRoute,
    });

    return {
      reply: llmResult.reply,
      sources: llmResult.sources,
      actions: llmResult.actions,
      conversationId: String(conversation._id),
    };
  }

  async rebuildGlobalIndex(secret: string) {
    const expected = this.configService.getOrThrow<string>(
      'assistant.indexRebuildSecret',
    );
    if (secret !== expected) {
      throw new UnauthorizedException('Invalid index rebuild secret');
    }
    return this.indexer.rebuildGlobalIndex();
  }

  async rebuildUserIndex(userId: string, authorization?: string) {
    return this.userSummaryJob.indexUser(userId, authorization);
  }

  private async ensureUserIndex(userId: string, authorization?: string) {
    const count = await this.chunkModel.countDocuments({
      scope: KnowledgeChunkScope.USER,
      userId: new Types.ObjectId(userId),
    });

    if (count === 0) {
      await this.userSummaryJob.indexUser(userId, authorization);
    }
  }

  private async persistConversation(
    userId: string,
    dto: ChatRequestDto,
    reply: string,
    sources: { title: string; source: string; route?: string }[],
    actions: { label: string; href: string }[],
  ) {
    const userMessage = {
      role: 'user' as const,
      content: dto.message,
      sources: [],
      actions: [],
      createdAt: new Date(),
    };
    const assistantMessage = {
      role: 'assistant' as const,
      content: reply,
      sources,
      actions,
      createdAt: new Date(),
    };

    if (dto.conversationId) {
      const existing = await this.conversationModel.findOne({
        _id: new Types.ObjectId(dto.conversationId),
        userId: new Types.ObjectId(userId),
      });

      if (existing) {
        existing.messages.push(userMessage, assistantMessage);
        await existing.save();
        return existing;
      }
    }

    return this.conversationModel.create({
      userId: new Types.ObjectId(userId),
      messages: [userMessage, assistantMessage],
    });
  }
}

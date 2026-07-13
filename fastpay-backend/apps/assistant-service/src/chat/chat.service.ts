import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  AssistantFeedback,
  AssistantFeedbackDocument,
  ChatConversation,
  ChatConversationDocument,
  KnowledgeChunk,
  KnowledgeChunkDocument,
  KnowledgeChunkScope,
} from '@fastpay/schemas';

import { ChatAuditService } from '../audit/chat-audit.service';
import { AnswerValidatorService } from '../generation/answer-validator.service';
import { LlmService } from '../generation/llm.service';
import { IndexerService } from '../indexing/indexer.service';
import { UserSummaryJobService } from '../indexing/user-summary.job';
import { RetrieverService } from '../retrieval/retriever.service';
import { RateLimiterService } from '../security/rate-limiter.service';
import { ChatRequestDto } from './dto/chat.dto';
import { FeedbackRequestDto } from './dto/feedback.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly configService: ConfigService,
    private readonly retriever: RetrieverService,
    private readonly llm: LlmService,
    private readonly answerValidator: AnswerValidatorService,
    private readonly indexer: IndexerService,
    private readonly userSummaryJob: UserSummaryJobService,
    private readonly rateLimiter: RateLimiterService,
    private readonly chatAudit: ChatAuditService,
    @InjectModel(ChatConversation.name)
    private readonly conversationModel: Model<ChatConversationDocument>,
    @InjectModel(KnowledgeChunk.name)
    private readonly chunkModel: Model<KnowledgeChunkDocument>,
    @InjectModel(AssistantFeedback.name)
    private readonly feedbackModel: Model<AssistantFeedbackDocument>,
  ) {}

  async chat(userId: string, dto: ChatRequestDto, authorization?: string) {
    const started = Date.now();
    await this.rateLimiter.checkLimit(userId);

    await this.ensureUserIndex(userId, authorization);

    const topK = this.configService.getOrThrow<number>('assistant.topK');
    const { chunks, retrievalMeta } = await this.retriever.retrieve({
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
      walletBalanceRwf: dto.context?.walletBalanceRwf,
      walletBalanceUsdt: dto.context?.walletBalanceUsdt,
      cryptoPortfolioSummary: dto.context?.cryptoPortfolioSummary,
      engagementSummary: dto.context?.engagementSummary,
    });

    const usedLlm = Boolean(this.configService.get<string>('assistant.openAiApiKey'));
    const baseConfidence =
      retrievalMeta.maxScore >= 0.8 ? 0.85 : retrievalMeta.maxScore >= 0.35 ? 0.65 : 0.35;

    const validated = this.answerValidator.validate({
      reply: llmResult.reply,
      sources: llmResult.sources,
      actions: llmResult.actions,
      confidence: baseConfidence,
      walletBalanceRwf: dto.context?.walletBalanceRwf,
      walletBalanceUsdt: dto.context?.walletBalanceUsdt,
      corpusWasRetrieved: chunks.length > 0,
      usedLlm,
    });

    const conversation = await this.persistConversation(
      userId,
      dto,
      validated.reply,
      validated.sources,
      validated.actions,
    );

    const model =
      this.configService.get<string>('assistant.openAiApiKey')
        ? this.configService.getOrThrow<string>('assistant.llmModel')
        : 'fallback-local';

    await this.chatAudit.logChatTurn({
      userId,
      message: dto.message,
      reply: validated.reply,
      chunkIds: chunks.map((chunk) => chunk.id),
      model,
      latencyMs: Date.now() - started,
      conversationId: String(conversation._id),
      currentRoute: dto.context?.currentRoute,
      retrievalMeta,
      confidence: validated.confidence,
    });

    return {
      reply: validated.reply,
      sources: validated.sources,
      actions: validated.actions,
      conversationId: String(conversation._id),
      retrievalMeta,
      confidence: validated.confidence,
    };
  }

  async recordFeedback(userId: string, dto: FeedbackRequestDto) {
    await this.feedbackModel.create({
      userId: new Types.ObjectId(userId),
      conversationId: dto.conversationId,
      messageId: dto.messageId,
      rating: dto.rating,
      intent: dto.intent,
      confidence: dto.confidence,
      chunkIds: dto.chunkIds ?? [],
      engine: dto.engine,
      comment: dto.comment,
    });

    await this.chatAudit.logFeedback({
      userId,
      messageId: dto.messageId,
      rating: dto.rating,
      intent: dto.intent,
      confidence: dto.confidence,
      chunkIds: dto.chunkIds ?? [],
      engine: dto.engine,
      comment: dto.comment,
    });

    return { ok: true };
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

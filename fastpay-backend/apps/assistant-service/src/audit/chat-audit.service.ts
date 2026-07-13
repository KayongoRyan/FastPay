import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AuditLog, AuditLogDocument } from '@fastpay/schemas';

import type { RetrievalMeta } from '../generation/answer-validator.service';

@Injectable()
export class ChatAuditService {
  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditModel: Model<AuditLogDocument>,
  ) {}

  async logChatTurn(params: {
    userId: string;
    message: string;
    reply: string;
    chunkIds: string[];
    model: string;
    latencyMs: number;
    conversationId?: string;
    currentRoute?: string;
    retrievalMeta?: RetrievalMeta;
    confidence?: number;
  }): Promise<void> {
    await this.auditModel.create({
      userId: new Types.ObjectId(params.userId),
      action: 'assistant.chat',
      details: {
        messagePreview: params.message.slice(0, 200),
        replyPreview: params.reply.slice(0, 300),
        chunkIds: params.chunkIds,
        model: params.model,
        latencyMs: params.latencyMs,
        conversationId: params.conversationId,
        currentRoute: params.currentRoute,
        retrievalMeta: params.retrievalMeta,
        confidence: params.confidence,
      },
    });
  }

  async logFeedback(params: {
    userId: string;
    messageId: string;
    rating: 1 | -1;
    intent: string;
    confidence: number;
    chunkIds: string[];
    engine: 'local' | 'cloud';
    comment?: string;
  }): Promise<void> {
    await this.auditModel.create({
      userId: new Types.ObjectId(params.userId),
      action: 'assistant.feedback',
      details: {
        messageId: params.messageId,
        rating: params.rating,
        intent: params.intent,
        confidence: params.confidence,
        chunkIds: params.chunkIds,
        engine: params.engine,
        comment: params.comment,
      },
    });
  }
}

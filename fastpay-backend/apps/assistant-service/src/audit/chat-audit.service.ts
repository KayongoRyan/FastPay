import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AuditLog, AuditLogDocument } from '@fastpay/schemas';

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
      },
    });
  }
}

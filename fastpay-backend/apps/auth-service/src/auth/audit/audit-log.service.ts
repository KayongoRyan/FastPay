import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AuditLog, AuditLogDocument } from '@fastpay/schemas';

import { AuditEventInput } from './audit.constants';

function defaultCategory(action: string): 'auth' | 'payment' | 'security' | 'assistant' {
  if (action.startsWith('assistant.')) return 'assistant';
  if (action.startsWith('payment.')) return 'payment';
  if (action.startsWith('security.')) return 'security';
  return 'auth';
}

function defaultSeverity(action: string): 'info' | 'warn' | 'critical' {
  if (action.includes('failed') || action.includes('locked') || action.includes('block')) {
    return 'warn';
  }
  if (action.includes('freeze') || action.includes('critical')) {
    return 'critical';
  }
  return 'info';
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
  ) {}

  async record(event: AuditEventInput): Promise<void> {
    try {
      await this.auditLogModel.create({
        userId: event.userId ? new Types.ObjectId(event.userId) : undefined,
        action: event.action,
        ipAddress: event.context?.ipAddress,
        userAgent: event.context?.userAgent,
        sessionId: event.context?.sessionId,
        deviceId: event.context?.deviceId,
        category: event.category ?? defaultCategory(event.action),
        severity: event.severity ?? defaultSeverity(event.action),
        details: event.details ?? {},
      });
    } catch (error) {
      this.logger.error(
        `Failed to write audit log (${event.action}): ${
          error instanceof Error ? error.message : error
        }`,
      );
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AuditLog, AuditLogDocument } from '@fastpay/schemas';

import { PaymentAuditEvent } from './audit.constants';

@Injectable()
export class PaymentAuditService {
  private readonly logger = new Logger(PaymentAuditService.name);

  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
  ) {}

  async record(event: PaymentAuditEvent): Promise<void> {
    try {
      await this.auditLogModel.create({
        userId: event.userId ? new Types.ObjectId(event.userId) : undefined,
        action: event.action,
        category: 'payment',
        severity: event.action.includes('failed') ? 'warn' : 'info',
        details: event.details ?? {},
      });
    } catch (error) {
      this.logger.error(
        `Failed to write payment audit (${event.action}): ${
          error instanceof Error ? error.message : error
        }`,
      );
    }
  }
}

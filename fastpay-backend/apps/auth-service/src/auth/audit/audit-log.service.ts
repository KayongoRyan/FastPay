import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AuditLog, AuditLogDocument } from '@fastpay/schemas';

import { AuditEventInput } from './audit.constants';

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

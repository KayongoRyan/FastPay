import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ collection: 'audit_logs', timestamps: { createdAt: true, updatedAt: false } })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId?: Types.ObjectId;

  @Prop({ required: true })
  action!: string;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop()
  sessionId?: string;

  @Prop()
  deviceId?: string;

  @Prop({ enum: ['auth', 'payment', 'security', 'assistant'] })
  category?: 'auth' | 'payment' | 'security' | 'assistant';

  @Prop({ enum: ['info', 'warn', 'critical'], default: 'info' })
  severity!: 'info' | 'warn' | 'critical';

  @Prop({ type: Object, default: {} })
  details!: Record<string, unknown>;

  @Prop()
  blockchainHash?: string;

  createdAt?: Date;
}

export type AuditLogDocument = HydratedDocument<AuditLog>;
export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum SecurityAlertType {
  NEW_LOGIN = 'new_login',
  FAILED_LOGIN = 'failed_login',
  DEVICE_ENROLLED = 'device_enrolled',
  TX_FLAGGED = 'tx_flagged',
  ACCOUNT_FROZEN = 'account_frozen',
  SESSION_REVOKED = 'session_revoked',
}

@Schema({ collection: 'security_alerts', timestamps: { createdAt: true, updatedAt: false } })
export class SecurityAlert {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ enum: Object.values(SecurityAlertType), required: true })
  type!: SecurityAlertType;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  body!: string;

  @Prop()
  readAt?: Date;

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, unknown>;

  createdAt?: Date;
}

export type SecurityAlertDocument = HydratedDocument<SecurityAlert>;
export const SecurityAlertSchema = SchemaFactory.createForClass(SecurityAlert);

SecurityAlertSchema.index({ userId: 1, createdAt: -1 });
SecurityAlertSchema.index({ userId: 1, readAt: 1 });

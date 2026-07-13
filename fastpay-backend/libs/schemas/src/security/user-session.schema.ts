import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ collection: 'user_sessions', timestamps: { createdAt: true, updatedAt: false } })
export class UserSession {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  sessionId!: string;

  @Prop({ required: true, select: false })
  refreshTokenHash!: string;

  @Prop()
  deviceLabel?: string;

  @Prop()
  deviceId?: string;

  @Prop()
  platform?: string;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop({ required: true })
  lastActiveAt!: Date;

  @Prop()
  revokedAt?: Date;

  createdAt?: Date;
}

export type UserSessionDocument = HydratedDocument<UserSession>;
export const UserSessionSchema = SchemaFactory.createForClass(UserSession);

UserSessionSchema.index({ userId: 1, revokedAt: 1, lastActiveAt: -1 });

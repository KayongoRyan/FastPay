import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ collection: 'trusted_devices', timestamps: { createdAt: true, updatedAt: false } })
export class TrustedDevice {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, index: true })
  deviceId!: string;

  @Prop({ required: true })
  publicKey!: string;

  @Prop()
  platform?: string;

  @Prop({ required: true })
  enrolledAt!: Date;

  @Prop({ required: true })
  lastSeenAt!: Date;

  @Prop()
  revokedAt?: Date;

  createdAt?: Date;
}

export type TrustedDeviceDocument = HydratedDocument<TrustedDevice>;
export const TrustedDeviceSchema = SchemaFactory.createForClass(TrustedDevice);

TrustedDeviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true });
TrustedDeviceSchema.index({ userId: 1, revokedAt: 1 });

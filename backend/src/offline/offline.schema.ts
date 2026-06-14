import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum OfflineRelayStatus {
  QUEUED = 'queued',
  BROADCASTING = 'broadcasting',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

@Schema({ collection: 'offline_relay' })
export class OfflineRelay {
  @Prop({ required: true, unique: true, index: true })
  txHash!: string;

  @Prop({ required: true })
  signedXdr!: string;

  @Prop({
    enum: Object.values(OfflineRelayStatus),
    default: OfflineRelayStatus.QUEUED,
  })
  status!: OfflineRelayStatus;

  @Prop({ default: 0 })
  retryCount!: number;

  @Prop()
  lastError?: string;

  @Prop()
  onChainTxHash?: string;

  @Prop({ default: () => new Date() })
  createdAt!: Date;

  @Prop({ default: () => new Date() })
  updatedAt!: Date;
}

export type OfflineRelayDocument = HydratedDocument<OfflineRelay>;

export const OfflineRelaySchema = SchemaFactory.createForClass(OfflineRelay);

OfflineRelaySchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum OfflineRelayStatus {
  QUEUED = 'queued',
  BROADCASTING = 'broadcasting',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

@Schema({ collection: 'offline_relay', timestamps: true })
export class OfflineRelay {
  @Prop({ type: Types.ObjectId, ref: 'Wallet', index: true })
  walletId?: Types.ObjectId;

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

  @Prop()
  recipientPhone?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export type OfflineRelayDocument = HydratedDocument<OfflineRelay>;
export const OfflineRelaySchema = SchemaFactory.createForClass(OfflineRelay);

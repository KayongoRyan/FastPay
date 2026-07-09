import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum MomoPaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Schema({ collection: 'momo_payments', timestamps: true })
export class MomoPayment {
  @Prop({ required: true, index: true })
  walletPublicKey!: string;

  @Prop({ required: true, enum: ['mtn', 'airtel'] })
  provider!: string;

  @Prop({ required: true })
  phone!: string;

  @Prop({ required: true })
  amountRwf!: number;

  @Prop({ required: true, enum: Object.values(MomoPaymentStatus), default: MomoPaymentStatus.PENDING })
  status!: MomoPaymentStatus;

  @Prop()
  usdtCredited?: number;

  @Prop()
  message?: string;
}

export type MomoPaymentDocument = HydratedDocument<MomoPayment>;
export const MomoPaymentSchema = SchemaFactory.createForClass(MomoPayment);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum TransactionType {
  PAYMENT = 'payment',
  TRANSFER = 'transfer',
  ESCROW = 'escrow',
  SAVINGS = 'savings',
}

export enum TransactionStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  BROADCASTING = 'broadcasting',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

@Schema({ collection: 'transactions', timestamps: { createdAt: true, updatedAt: false } })
export class Transaction {
  @Prop({ type: Types.ObjectId, ref: 'Wallet', required: true, index: true })
  walletId!: Types.ObjectId;

  @Prop({ required: true, unique: true })
  txHash!: string;

  @Prop({ required: true, default: 'stellar' })
  chain!: string;

  @Prop({ enum: Object.values(TransactionType), required: true })
  type!: TransactionType;

  @Prop({ required: true })
  amount!: string;

  @Prop({ required: true, default: 'XLM' })
  token!: string;

  @Prop({ required: true })
  netAmount!: number;

  @Prop({ default: '0' })
  fee!: string;

  @Prop({ required: true })
  fromAddress!: string;

  @Prop({ required: true })
  toAddress!: string;

  @Prop({ enum: Object.values(TransactionStatus), default: TransactionStatus.PENDING })
  status!: TransactionStatus;

  @Prop()
  blockNumber?: number;

  @Prop()
  ledgerCloseTime?: Date;

  @Prop()
  confirmedAt?: Date;
}

export type TransactionDocument = HydratedDocument<Transaction>;
export const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.index({ walletId: 1, createdAt: -1 });
TransactionSchema.index({ fromAddress: 1, toAddress: 1 });

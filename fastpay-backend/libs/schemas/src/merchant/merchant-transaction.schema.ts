import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum MerchantPaymentChannel {
  BANK_PAY = 'bank_pay',
  INVOICE = 'invoice',
  QR = 'qr',
}

@Schema({ collection: 'merchant_transactions', timestamps: { createdAt: true, updatedAt: false } })
export class MerchantTransaction {
  @Prop({ type: Types.ObjectId, ref: 'MerchantOrg', required: true, index: true })
  merchantOrgId!: Types.ObjectId;

  @Prop({ required: true })
  amountRwf!: number;

  @Prop({ enum: Object.values(MerchantPaymentChannel), required: true })
  channel!: MerchantPaymentChannel;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  consumerUserId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'MerchantInvoice' })
  invoiceId?: Types.ObjectId;

  @Prop()
  merchantCode?: string;

  @Prop()
  paymentRef?: string;

  @Prop()
  txHash?: string;

  @Prop({ default: 'confirmed' })
  status!: string;

  @Prop()
  beneficiaryLabel?: string;

  createdAt?: Date;
}

export type MerchantTransactionDocument = HydratedDocument<MerchantTransaction>;
export const MerchantTransactionSchema =
  SchemaFactory.createForClass(MerchantTransaction);

MerchantTransactionSchema.index({ merchantOrgId: 1, createdAt: -1 });

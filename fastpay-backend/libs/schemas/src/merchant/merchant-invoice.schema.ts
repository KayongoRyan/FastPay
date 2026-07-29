import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum MerchantInvoiceStatus {
  OPEN = 'open',
  PAID = 'paid',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Schema({ collection: 'merchant_invoices', timestamps: true })
export class MerchantInvoice {
  @Prop({ type: Types.ObjectId, ref: 'MerchantOrg', required: true, index: true })
  merchantOrgId!: Types.ObjectId;

  @Prop({ required: true })
  invoiceNumber!: string;

  @Prop({ required: true })
  amountRwf!: number;

  @Prop({ trim: true })
  description?: string;

  @Prop({ enum: Object.values(MerchantInvoiceStatus), default: MerchantInvoiceStatus.OPEN })
  status!: MerchantInvoiceStatus;

  @Prop()
  expiresAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  paidByUserId?: Types.ObjectId;

  @Prop()
  paymentRef?: string;

  @Prop()
  paidAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export type MerchantInvoiceDocument = HydratedDocument<MerchantInvoice>;
export const MerchantInvoiceSchema = SchemaFactory.createForClass(MerchantInvoice);

MerchantInvoiceSchema.index({ merchantOrgId: 1, createdAt: -1 });
MerchantInvoiceSchema.index({ invoiceNumber: 1, merchantOrgId: 1 }, { unique: true });

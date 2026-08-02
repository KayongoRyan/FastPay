import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum MerchantOrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
}

@Schema({ collection: 'merchant_orders', timestamps: true })
export class MerchantOrder {
  @Prop({ type: Types.ObjectId, ref: 'MerchantOrg', required: true, index: true })
  merchantOrgId!: Types.ObjectId;

  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  orderNumber!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  buyerUserId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'EscrowContract', index: true })
  escrowId?: Types.ObjectId;

  @Prop({ required: true, min: 100 })
  amountRwf!: number;

  @Prop({ trim: true })
  title?: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({
    enum: Object.values(MerchantOrderStatus),
    default: MerchantOrderStatus.PENDING,
    index: true,
  })
  status!: MerchantOrderStatus;

  @Prop({ trim: true })
  shippingNote?: string;

  @Prop()
  shippedAt?: Date;

  @Prop()
  deliveredAt?: Date;

  @Prop()
  completedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export type MerchantOrderDocument = HydratedDocument<MerchantOrder>;
export const MerchantOrderSchema = SchemaFactory.createForClass(MerchantOrder);

MerchantOrderSchema.index({ merchantOrgId: 1, createdAt: -1 });
MerchantOrderSchema.index({ buyerUserId: 1, createdAt: -1 });

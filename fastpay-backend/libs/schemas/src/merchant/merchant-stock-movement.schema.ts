import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum MerchantStockMovementType {
  STOCK_IN = 'stock_in',
  SALE = 'sale',
  ADJUSTMENT = 'adjustment',
  RETURN = 'return',
  WRITE_OFF = 'write_off',
}

@Schema({ collection: 'merchant_stock_movements', timestamps: true })
export class MerchantStockMovement {
  @Prop({ type: Types.ObjectId, ref: 'MerchantOrg', required: true, index: true })
  merchantOrgId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'MerchantProduct', required: true, index: true })
  productId!: Types.ObjectId;

  @Prop({
    enum: Object.values(MerchantStockMovementType),
    required: true,
  })
  type!: MerchantStockMovementType;

  /** Positive = increase, negative = decrease */
  @Prop({ required: true })
  quantityDelta!: number;

  @Prop({ required: true })
  quantityAfter!: number;

  @Prop({ trim: true })
  note?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  recordedByUserId?: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

export type MerchantStockMovementDocument = HydratedDocument<MerchantStockMovement>;
export const MerchantStockMovementSchema =
  SchemaFactory.createForClass(MerchantStockMovement);

MerchantStockMovementSchema.index({ merchantOrgId: 1, createdAt: -1 });
MerchantStockMovementSchema.index({ productId: 1, createdAt: -1 });

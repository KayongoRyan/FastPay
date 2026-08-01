import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum MerchantProductStatus {
  ACTIVE = 'active',
  OUT_OF_STOCK = 'out_of_stock',
  ARCHIVED = 'archived',
}

@Schema({ collection: 'merchant_products', timestamps: true })
export class MerchantProduct {
  @Prop({ type: Types.ObjectId, ref: 'MerchantOrg', required: true, index: true })
  merchantOrgId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true, uppercase: true })
  sku?: string;

  @Prop({ trim: true })
  category?: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true, default: 'unit' })
  unit!: string;

  @Prop({ default: 0 })
  stockQty!: number;

  @Prop({ default: 0 })
  reorderLevel!: number;

  @Prop({ default: 0 })
  costPriceRwf!: number;

  @Prop({ default: 0 })
  sellPriceRwf!: number;

  @Prop({
    enum: Object.values(MerchantProductStatus),
    default: MerchantProductStatus.ACTIVE,
  })
  status!: MerchantProductStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

export type MerchantProductDocument = HydratedDocument<MerchantProduct>;
export const MerchantProductSchema = SchemaFactory.createForClass(MerchantProduct);

MerchantProductSchema.index({ merchantOrgId: 1, createdAt: -1 });
MerchantProductSchema.index(
  { merchantOrgId: 1, sku: 1 },
  { unique: true, sparse: true },
);

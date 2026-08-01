import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum MerchantGoalHorizon {
  SHORT = 'short',
  LONG = 'long',
}

export enum MerchantGoalKind {
  REVENUE = 'revenue',
  SALES_COUNT = 'sales_count',
  STOCK_LEVEL = 'stock_level',
  CUSTOM = 'custom',
}

export enum MerchantGoalStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Schema({ collection: 'merchant_goals', timestamps: true })
export class MerchantGoal {
  @Prop({ type: Types.ObjectId, ref: 'MerchantOrg', required: true, index: true })
  merchantOrgId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({
    enum: Object.values(MerchantGoalHorizon),
    default: MerchantGoalHorizon.SHORT,
  })
  horizon!: MerchantGoalHorizon;

  @Prop({
    enum: Object.values(MerchantGoalKind),
    default: MerchantGoalKind.CUSTOM,
  })
  kind!: MerchantGoalKind;

  @Prop({ required: true, default: 0 })
  targetValue!: number;

  @Prop({ default: 0 })
  currentValue!: number;

  @Prop()
  deadline?: Date;

  @Prop({
    enum: Object.values(MerchantGoalStatus),
    default: MerchantGoalStatus.ACTIVE,
  })
  status!: MerchantGoalStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

export type MerchantGoalDocument = HydratedDocument<MerchantGoal>;
export const MerchantGoalSchema = SchemaFactory.createForClass(MerchantGoal);

MerchantGoalSchema.index({ merchantOrgId: 1, status: 1, createdAt: -1 });

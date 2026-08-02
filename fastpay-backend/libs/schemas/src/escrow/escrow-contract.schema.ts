import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/** Matches Merchant Protection Architecture statuses. */
export enum EscrowStatus {
  PENDING = 'pending',
  PAID = 'paid',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  RELEASED = 'released',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Schema({ _id: false })
export class EscrowReleaseRules {
  /** Buyer must confirm before release (default true). */
  @Prop({ default: true })
  requiresBuyerConfirm!: boolean;

  /** Auto-release after this many hours past delivery (optional). */
  @Prop()
  autoReleaseHoursAfterDelivery?: number;

  /** Absolute auto-release deadline once funded. */
  @Prop()
  autoReleaseAt?: Date;
}

export const EscrowReleaseRulesSchema =
  SchemaFactory.createForClass(EscrowReleaseRules);

@Schema({ collection: 'escrow_contracts', timestamps: true })
export class EscrowContract {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  escrowCode!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  buyerUserId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'MerchantOrg', required: true, index: true })
  sellerMerchantOrgId!: Types.ObjectId;

  @Prop({ trim: true, uppercase: true })
  sellerMerchantCode?: string;

  @Prop({ trim: true })
  sellerBusinessName?: string;

  @Prop({ required: true, min: 100 })
  amountRwf!: number;

  @Prop({ default: 'RWF' })
  currency!: string;

  @Prop({
    enum: Object.values(EscrowStatus),
    default: EscrowStatus.PENDING,
    index: true,
  })
  status!: EscrowStatus;

  @Prop({ type: EscrowReleaseRulesSchema, default: () => ({}) })
  releaseRules!: EscrowReleaseRules;

  @Prop({ trim: true })
  title?: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'MerchantInvoice' })
  invoiceId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'MerchantOrder' })
  orderId?: Types.ObjectId;

  @Prop()
  fundedAt?: Date;

  @Prop()
  fundedPaymentRef?: string;

  @Prop()
  shippedAt?: Date;

  @Prop({ trim: true })
  shippingNote?: string;

  @Prop()
  deliveredAt?: Date;

  @Prop()
  releasedAt?: Date;

  @Prop()
  releasePaymentRef?: string;

  @Prop()
  disputedAt?: Date;

  @Prop({ trim: true })
  disputeReason?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  disputedByUserId?: Types.ObjectId;

  @Prop()
  cancelledAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export type EscrowContractDocument = HydratedDocument<EscrowContract>;
export const EscrowContractSchema = SchemaFactory.createForClass(EscrowContract);

EscrowContractSchema.index({ buyerUserId: 1, createdAt: -1 });
EscrowContractSchema.index({ sellerMerchantOrgId: 1, createdAt: -1 });
EscrowContractSchema.index({ status: 1, createdAt: -1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/** Matches Wallet Insurance claim pipeline. */
export enum InsuranceClaimStatus {
  SUBMITTED = 'submitted',
  INVESTIGATING = 'investigating',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
}

@Schema({ collection: 'insurance_claims', timestamps: true })
export class InsuranceClaim {
  @Prop({ type: Types.ObjectId, ref: 'InsurancePolicy', required: true, index: true })
  policyId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  claimNumber!: string;

  @Prop({ required: true, min: 100 })
  amountRwf!: number;

  @Prop({
    enum: Object.values(InsuranceClaimStatus),
    default: InsuranceClaimStatus.SUBMITTED,
    index: true,
  })
  status!: InsuranceClaimStatus;

  /** Why the wallet was drained / loss description */
  @Prop({ required: true, trim: true })
  reason!: string;

  @Prop({ trim: true })
  drainTxRef?: string;

  @Prop({ trim: true })
  evidenceNote?: string;

  @Prop()
  submittedAt?: Date;

  @Prop()
  investigationStartedAt?: Date;

  @Prop()
  reviewedAt?: Date;

  @Prop({ trim: true })
  reviewNote?: string;

  @Prop()
  paidAt?: Date;

  @Prop({ trim: true })
  payoutRef?: string;

  @Prop({ default: 0 })
  fraudRiskScore?: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export type InsuranceClaimDocument = HydratedDocument<InsuranceClaim>;
export const InsuranceClaimSchema = SchemaFactory.createForClass(InsuranceClaim);

InsuranceClaimSchema.index({ userId: 1, createdAt: -1 });
InsuranceClaimSchema.index({ policyId: 1, createdAt: -1 });

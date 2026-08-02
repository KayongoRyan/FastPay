import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum InsurancePolicyStatus {
  QUOTED = 'quoted',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

@Schema({ _id: false })
export class InsuranceRiskScores {
  @Prop({ default: 50 })
  deviceReputation!: number;

  @Prop({ default: 50 })
  transactionHistory!: number;

  @Prop({ default: 50 })
  kycScore!: number;

  @Prop({ default: 50 })
  securityScore!: number;

  @Prop({ default: 50 })
  fraudDetection!: number;

  /** Weighted 0–100 (higher = safer). */
  @Prop({ default: 50 })
  overall!: number;
}

export const InsuranceRiskScoresSchema =
  SchemaFactory.createForClass(InsuranceRiskScores);

@Schema({ collection: 'insurance_policies', timestamps: true })
export class InsurancePolicy {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  policyNumber!: string;

  @Prop({
    enum: Object.values(InsurancePolicyStatus),
    default: InsurancePolicyStatus.QUOTED,
    index: true,
  })
  status!: InsurancePolicyStatus;

  /** Monthly premium in RWF */
  @Prop({ required: true, min: 0 })
  premiumRwf!: number;

  /** Max payout per claim */
  @Prop({ required: true, min: 0 })
  coverageLimitRwf!: number;

  @Prop({ type: InsuranceRiskScoresSchema, default: () => ({}) })
  riskScores!: InsuranceRiskScores;

  @Prop()
  issuedAt?: Date;

  @Prop()
  nextBillingAt?: Date;

  @Prop()
  cancelledAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export type InsurancePolicyDocument = HydratedDocument<InsurancePolicy>;
export const InsurancePolicySchema = SchemaFactory.createForClass(InsurancePolicy);

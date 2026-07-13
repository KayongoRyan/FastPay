import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum FraudCaseStatus {
  OPEN = 'open',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum FraudDecision {
  ALLOW = 'allow',
  REVIEW = 'review',
  BLOCK = 'block',
}

@Schema({ collection: 'fraud_cases', timestamps: true })
export class FraudCase {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId?: Types.ObjectId;

  @Prop({ required: true, index: true })
  txHash!: string;

  @Prop({ enum: Object.values(FraudDecision), required: true })
  decision!: FraudDecision;

  @Prop({ required: true })
  riskScore!: number;

  @Prop({ type: [String], default: [] })
  ruleHits!: string[];

  @Prop({ type: [String], default: [] })
  reasons!: string[];

  @Prop({
    enum: Object.values(FraudCaseStatus),
    default: FraudCaseStatus.OPEN,
  })
  status!: FraudCaseStatus;

  @Prop({ type: Object, default: {} })
  context!: Record<string, unknown>;

  createdAt?: Date;
  updatedAt?: Date;
}

export type FraudCaseDocument = HydratedDocument<FraudCase>;
export const FraudCaseSchema = SchemaFactory.createForClass(FraudCase);

FraudCaseSchema.index({ status: 1, createdAt: -1 });

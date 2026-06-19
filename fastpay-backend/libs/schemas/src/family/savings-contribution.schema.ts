import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ collection: 'savings_contributions', timestamps: false })
export class SavingsContribution {
  @Prop({ type: Types.ObjectId, ref: 'FamilySavingsGoal', required: true, index: true })
  goalId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  amount!: number;

  @Prop()
  transactionHash?: string;

  @Prop({ default: () => new Date() })
  contributedAt!: Date;
}

export type SavingsContributionDocument = HydratedDocument<SavingsContribution>;
export const SavingsContributionSchema = SchemaFactory.createForClass(SavingsContribution);

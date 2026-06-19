import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum SavingsGoalStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Schema({ collection: 'family_savings_goals', timestamps: { createdAt: true, updatedAt: false } })
export class FamilySavingsGoal {
  @Prop({ type: Types.ObjectId, ref: 'Family', required: true, index: true })
  familyId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  targetAmount!: number;

  @Prop({ default: 0 })
  currentAmount!: number;

  @Prop({ default: 'XLM' })
  token!: string;

  @Prop()
  deadline?: Date;

  @Prop({ enum: Object.values(SavingsGoalStatus), default: SavingsGoalStatus.ACTIVE })
  status!: SavingsGoalStatus;

  @Prop()
  contractAddress?: string;
}

export type FamilySavingsGoalDocument = HydratedDocument<FamilySavingsGoal>;
export const FamilySavingsGoalSchema = SchemaFactory.createForClass(FamilySavingsGoal);

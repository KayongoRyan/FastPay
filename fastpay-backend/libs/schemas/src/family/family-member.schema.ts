import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum FamilyRole {
  PARENT = 'parent',
  CHILD = 'child',
  GUARDIAN = 'guardian',
}

@Schema({ collection: 'family_members', timestamps: false })
export class FamilyMember {
  @Prop({ type: Types.ObjectId, ref: 'Family', required: true, index: true })
  familyId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ enum: Object.values(FamilyRole), required: true })
  role!: FamilyRole;

  @Prop()
  spendingLimitDaily?: number;

  @Prop()
  spendingLimitMonthly?: number;

  @Prop()
  requiresApprovalAbove?: number;

  @Prop({ default: () => new Date() })
  joinedAt!: Date;

  @Prop({ default: true })
  isActive!: boolean;
}

export type FamilyMemberDocument = HydratedDocument<FamilyMember>;
export const FamilyMemberSchema = SchemaFactory.createForClass(FamilyMember);

FamilyMemberSchema.index({ familyId: 1, userId: 1 }, { unique: true });

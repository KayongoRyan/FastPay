import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import { FamilyRole } from './family-member.schema';

export enum FamilyInviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
}

@Schema({ collection: 'family_invites', timestamps: true })
export class FamilyInvite {
  @Prop({ type: Types.ObjectId, ref: 'Family', required: true, index: true })
  familyId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  invitedBy!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  inviteeUserId?: Types.ObjectId;

  @Prop()
  inviteeEmail?: string;

  @Prop()
  inviteePhone?: string;

  @Prop({ enum: Object.values(FamilyRole), default: FamilyRole.CHILD })
  role!: FamilyRole;

  @Prop()
  spendingLimitDaily?: number;

  @Prop()
  spendingLimitMonthly?: number;

  @Prop()
  requiresApprovalAbove?: number;

  @Prop({ required: true, unique: true, index: true })
  token!: string;

  @Prop({ enum: Object.values(FamilyInviteStatus), default: FamilyInviteStatus.PENDING })
  status!: FamilyInviteStatus;

  @Prop({ required: true })
  expiresAt!: Date;
}

export type FamilyInviteDocument = HydratedDocument<FamilyInvite>;
export const FamilyInviteSchema = SchemaFactory.createForClass(FamilyInvite);

FamilyInviteSchema.index({ familyId: 1, status: 1 });

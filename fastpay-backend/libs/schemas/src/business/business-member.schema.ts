import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum BusinessMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  FINANCE = 'finance',
  VIEWER = 'viewer',
}

export enum BusinessMemberStatus {
  ACTIVE = 'active',
  INVITED = 'invited',
  REVOKED = 'revoked',
}

@Schema({ collection: 'business_members', timestamps: true })
export class BusinessMember {
  @Prop({ type: Types.ObjectId, ref: 'BusinessOrg', required: true, index: true })
  businessOrgId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  fullName!: string;

  @Prop({ trim: true, lowercase: true })
  email?: string;

  @Prop({
    enum: Object.values(BusinessMemberRole),
    default: BusinessMemberRole.VIEWER,
  })
  role!: BusinessMemberRole;

  @Prop({
    enum: Object.values(BusinessMemberStatus),
    default: BusinessMemberStatus.ACTIVE,
  })
  status!: BusinessMemberStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

export type BusinessMemberDocument = HydratedDocument<BusinessMember>;
export const BusinessMemberSchema = SchemaFactory.createForClass(BusinessMember);

BusinessMemberSchema.index({ businessOrgId: 1, email: 1 }, { sparse: true });
BusinessMemberSchema.index({ businessOrgId: 1, userId: 1 }, { sparse: true });

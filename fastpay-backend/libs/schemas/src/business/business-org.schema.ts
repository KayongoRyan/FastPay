import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum BusinessOrgStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

@Schema({ collection: 'business_orgs', timestamps: true })
export class BusinessOrg {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerUserId!: Types.ObjectId;

  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  businessCode!: string;

  @Prop({ required: true, trim: true })
  companyName!: string;

  @Prop({ trim: true })
  industry?: string;

  @Prop({ trim: true })
  companyEmail?: string;

  @Prop({ trim: true })
  companyPhone?: string;

  @Prop({ trim: true })
  address?: string;

  @Prop({ trim: true })
  country?: string;

  @Prop({
    enum: Object.values(BusinessOrgStatus),
    default: BusinessOrgStatus.ACTIVE,
  })
  status!: BusinessOrgStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

export type BusinessOrgDocument = HydratedDocument<BusinessOrg>;
export const BusinessOrgSchema = SchemaFactory.createForClass(BusinessOrg);

BusinessOrgSchema.index({ ownerUserId: 1 }, { unique: true });

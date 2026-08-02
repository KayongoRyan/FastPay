import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum BusinessOrgStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

/** Shared vertical catalog for HQ orgs and merchant shops. */
export enum BusinessType {
  RETAIL = 'retail',
  GARAGE = 'garage',
  CONSTRUCTION = 'construction',
  HOSPITALITY = 'hospitality',
  RESTAURANT = 'restaurant',
  WHOLESALE = 'wholesale',
  TRANSPORT = 'transport',
  AGRICULTURE = 'agriculture',
  MANUFACTURING = 'manufacturing',
  HEALTHCARE = 'healthcare',
  EDUCATION = 'education',
  PROFESSIONAL_SERVICES = 'professional_services',
  TECHNOLOGY = 'technology',
  REAL_ESTATE = 'real_estate',
  OTHER = 'other',
}

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  [BusinessType.RETAIL]: 'Retail shop',
  [BusinessType.GARAGE]: 'Garage / auto workshop',
  [BusinessType.CONSTRUCTION]: 'Construction company',
  [BusinessType.HOSPITALITY]: 'Hotel / hospitality',
  [BusinessType.RESTAURANT]: 'Restaurant / café',
  [BusinessType.WHOLESALE]: 'Wholesale / distribution',
  [BusinessType.TRANSPORT]: 'Transport / logistics',
  [BusinessType.AGRICULTURE]: 'Agriculture / agribusiness',
  [BusinessType.MANUFACTURING]: 'Manufacturing',
  [BusinessType.HEALTHCARE]: 'Healthcare / clinic',
  [BusinessType.EDUCATION]: 'Education / training',
  [BusinessType.PROFESSIONAL_SERVICES]: 'Professional services',
  [BusinessType.TECHNOLOGY]: 'Technology / IT',
  [BusinessType.REAL_ESTATE]: 'Real estate',
  [BusinessType.OTHER]: 'Other',
};

@Schema({ collection: 'business_orgs', timestamps: true })
export class BusinessOrg {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerUserId!: Types.ObjectId;

  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  businessCode!: string;

  @Prop({ required: true, trim: true })
  companyName!: string;

  @Prop({
    enum: Object.values(BusinessType),
    index: true,
  })
  businessType?: BusinessType;

  /** Free-text label / custom vertical (esp. when type is `other`). */
  @Prop({ trim: true })
  industry?: string;

  @Prop({ trim: true })
  companyEmail?: string;

  @Prop({ trim: true })
  companyPhone?: string;

  @Prop({ trim: true })
  address?: string;

  @Prop({ trim: true })
  city?: string;

  @Prop({ trim: true })
  country?: string;

  /** Rwanda TIN / tax identification number */
  @Prop({ trim: true, uppercase: true })
  taxId?: string;

  /** Company / RDB registration number */
  @Prop({ trim: true, uppercase: true })
  registrationNumber?: string;

  @Prop({ trim: true })
  website?: string;

  @Prop({ trim: true })
  description?: string;

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
BusinessOrgSchema.index({ businessType: 1, createdAt: -1 });

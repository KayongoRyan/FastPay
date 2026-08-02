import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum MerchantOrgStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

@Schema({ collection: 'merchant_orgs', timestamps: true })
export class MerchantOrg {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerUserId!: Types.ObjectId;

  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  merchantCode!: string;

  @Prop({ required: true, trim: true })
  businessName!: string;

  /** Shop vertical — BusinessType value (retail, garage, …). */
  @Prop({ trim: true, index: true })
  category?: string;

  @Prop({ trim: true })
  businessEmail?: string;

  @Prop({ trim: true })
  businessPhone?: string;

  @Prop({ trim: true })
  address?: string;

  @Prop({ trim: true })
  city?: string;

  @Prop({ trim: true, uppercase: true })
  taxId?: string;

  @Prop({ enum: Object.values(MerchantOrgStatus), default: MerchantOrgStatus.ACTIVE })
  status!: MerchantOrgStatus;

  @Prop({ default: 0 })
  totalReceivedRwf!: number;

  @Prop()
  settlementPublicKey?: string;

  /** Optional link to a parent business (HQ) org */
  @Prop({ type: Types.ObjectId, ref: 'BusinessOrg', index: true })
  businessOrgId?: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

export type MerchantOrgDocument = HydratedDocument<MerchantOrg>;
export const MerchantOrgSchema = SchemaFactory.createForClass(MerchantOrg);

MerchantOrgSchema.index({ ownerUserId: 1 });
MerchantOrgSchema.index({ businessOrgId: 1, createdAt: -1 });

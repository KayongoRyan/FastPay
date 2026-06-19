import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum KycVerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema({ collection: 'kyc_documents', timestamps: { createdAt: true, updatedAt: false } })
export class KycDocument {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  documentType!: string;

  @Prop({ required: true })
  s3Key!: string;

  @Prop({ enum: Object.values(KycVerificationStatus), default: KycVerificationStatus.PENDING })
  verificationStatus!: KycVerificationStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  verifiedBy?: Types.ObjectId;

  @Prop()
  verifiedAt?: Date;
}

export type KycDocumentDocument = HydratedDocument<KycDocument>;
export const KycDocumentSchema = SchemaFactory.createForClass(KycDocument);

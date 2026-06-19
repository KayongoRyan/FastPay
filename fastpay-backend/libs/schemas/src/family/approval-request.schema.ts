import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum ApprovalRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

@Schema({ collection: 'approval_requests', timestamps: { createdAt: true, updatedAt: false } })
export class ApprovalRequest {
  @Prop({ type: Types.ObjectId, ref: 'Family', required: true, index: true })
  familyId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  requesterId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  approverId?: Types.ObjectId;

  @Prop({ type: Object, required: true })
  transactionData!: Record<string, unknown>;

  @Prop({ enum: Object.values(ApprovalRequestStatus), default: ApprovalRequestStatus.PENDING })
  status!: ApprovalRequestStatus;

  @Prop()
  childSignature?: string;

  @Prop()
  parentSignature?: string;

  @Prop()
  expiresAt?: Date;

  @Prop()
  resolvedAt?: Date;
}

export type ApprovalRequestDocument = HydratedDocument<ApprovalRequest>;
export const ApprovalRequestSchema = SchemaFactory.createForClass(ApprovalRequest);

ApprovalRequestSchema.index({ familyId: 1, status: 1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum KycStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

@Schema({ collection: 'users', timestamps: true })
export class User {
  @Prop({ sparse: true })
  phone?: string;

  @Prop({ sparse: true })
  email?: string;

  @Prop({ required: true })
  fullName!: string;

  @Prop({ unique: true, sparse: true })
  nationalIdHash?: string;

  @Prop({ default: 0 })
  kycLevel!: number;

  @Prop({ enum: Object.values(KycStatus), default: KycStatus.PENDING })
  kycStatus!: KycStatus;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop()
  frozenUntil?: Date;

  @Prop({ default: false })
  biometricEnabled!: boolean;

  @Prop({ sparse: true })
  biometricDeviceId?: string;

  @Prop()
  biometricPublicKey?: string;

  @Prop({ select: false })
  passwordHash?: string;

  @Prop({ select: false })
  refreshTokenHash?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ phone: 1 }, { unique: true, sparse: true });
UserSchema.index({ email: 1 }, { unique: true, sparse: true });
UserSchema.index({ biometricDeviceId: 1 }, { unique: true, sparse: true });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum MerchantPayrollStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

@Schema({ collection: 'merchant_payroll_entries', timestamps: true })
export class MerchantPayrollEntry {
  @Prop({ type: Types.ObjectId, ref: 'MerchantOrg', required: true, index: true })
  merchantOrgId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'MerchantEmployee', required: true, index: true })
  employeeId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  employeeName!: string;

  @Prop({ required: true })
  amountRwf!: number;

  @Prop({ required: true })
  periodStart!: Date;

  @Prop({ required: true })
  periodEnd!: Date;

  @Prop({
    enum: Object.values(MerchantPayrollStatus),
    default: MerchantPayrollStatus.PENDING,
  })
  status!: MerchantPayrollStatus;

  @Prop()
  paidAt?: Date;

  @Prop({ trim: true })
  note?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export type MerchantPayrollEntryDocument = HydratedDocument<MerchantPayrollEntry>;
export const MerchantPayrollEntrySchema =
  SchemaFactory.createForClass(MerchantPayrollEntry);

MerchantPayrollEntrySchema.index({ merchantOrgId: 1, createdAt: -1 });
MerchantPayrollEntrySchema.index({ employeeId: 1, periodStart: -1 });

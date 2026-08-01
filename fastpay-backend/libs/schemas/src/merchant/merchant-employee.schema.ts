import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum MerchantEmployeeRole {
  MANAGER = 'manager',
  CASHIER = 'cashier',
  STOCK_KEEPER = 'stock_keeper',
  STAFF = 'staff',
}

export enum MerchantEmployeeStatus {
  ACTIVE = 'active',
  ON_LEAVE = 'on_leave',
  TERMINATED = 'terminated',
}

export enum MerchantPayCycle {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
}

@Schema({ collection: 'merchant_employees', timestamps: true })
export class MerchantEmployee {
  @Prop({ type: Types.ObjectId, ref: 'MerchantOrg', required: true, index: true })
  merchantOrgId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  fullName!: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true, lowercase: true })
  email?: string;

  @Prop({
    enum: Object.values(MerchantEmployeeRole),
    default: MerchantEmployeeRole.STAFF,
  })
  role!: MerchantEmployeeRole;

  @Prop({
    enum: Object.values(MerchantEmployeeStatus),
    default: MerchantEmployeeStatus.ACTIVE,
  })
  status!: MerchantEmployeeStatus;

  @Prop({ default: 0 })
  salaryRwf!: number;

  @Prop({
    enum: Object.values(MerchantPayCycle),
    default: MerchantPayCycle.MONTHLY,
  })
  payCycle!: MerchantPayCycle;

  @Prop()
  hiredAt?: Date;

  @Prop({ trim: true })
  notes?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export type MerchantEmployeeDocument = HydratedDocument<MerchantEmployee>;
export const MerchantEmployeeSchema = SchemaFactory.createForClass(MerchantEmployee);

MerchantEmployeeSchema.index({ merchantOrgId: 1, createdAt: -1 });

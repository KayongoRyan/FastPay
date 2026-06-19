import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ collection: 'families', timestamps: true })
export class Family {
  @Prop({ required: true })
  name!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  createdBy!: Types.ObjectId;

  @Prop({ unique: true, sparse: true })
  walletAddress?: string;
}

export type FamilyDocument = HydratedDocument<Family>;
export const FamilySchema = SchemaFactory.createForClass(Family);

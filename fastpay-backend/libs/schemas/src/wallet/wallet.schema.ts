import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ collection: 'wallets', timestamps: { createdAt: true, updatedAt: false } })
export class Wallet {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, default: 'stellar' })
  chain!: string;

  @Prop({ required: true, unique: true })
  address!: string;

  @Prop({ required: true })
  publicKey!: string;

  @Prop()
  encryptedKeyShardB?: string;

  @Prop({ type: Map, of: String, default: {} })
  balances!: Map<string, string>;

  @Prop({ default: false })
  isDefault!: boolean;

  @Prop()
  lastActivityAt?: Date;
}

export type WalletDocument = HydratedDocument<Wallet>;
export const WalletSchema = SchemaFactory.createForClass(Wallet);

WalletSchema.index({ userId: 1, isDefault: 1 });

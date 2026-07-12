import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum KnowledgeChunkScope {
  GLOBAL = 'global',
  USER = 'user',
}

export enum KnowledgeChunkCategory {
  SERVICE = 'service',
  QUICKLINK = 'quicklink',
  KYC = 'kyc',
  TRANSACTION = 'transaction',
  POLICY = 'policy',
  BUDGET = 'budget',
}

@Schema({ collection: 'knowledge_chunks', timestamps: { updatedAt: true, createdAt: true } })
export class KnowledgeChunk {
  @Prop({ required: true, unique: true, index: true })
  chunkKey!: string;

  @Prop({ required: true })
  text!: string;

  @Prop({ type: [Number], required: true })
  embedding!: number[];

  @Prop({ enum: Object.values(KnowledgeChunkScope), required: true, index: true })
  scope!: KnowledgeChunkScope;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId?: Types.ObjectId;

  @Prop({ required: true })
  source!: string;

  @Prop()
  title?: string;

  @Prop()
  route?: string;

  @Prop()
  actionRoute?: string;

  @Prop({ enum: Object.values(KnowledgeChunkCategory), required: true, index: true })
  category!: KnowledgeChunkCategory;
}

export type KnowledgeChunkDocument = HydratedDocument<KnowledgeChunk>;
export const KnowledgeChunkSchema = SchemaFactory.createForClass(KnowledgeChunk);

KnowledgeChunkSchema.index({ scope: 1, userId: 1 });
KnowledgeChunkSchema.index({ category: 1, route: 1 });

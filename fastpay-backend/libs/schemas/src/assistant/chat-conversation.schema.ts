import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ _id: false })
export class ChatMessageEntry {
  @Prop({ required: true, enum: ['user', 'assistant'] })
  role!: 'user' | 'assistant';

  @Prop({ required: true })
  content!: string;

  @Prop({ type: [Object], default: [] })
  sources!: { title: string; source: string; route?: string }[];

  @Prop({ type: [Object], default: [] })
  actions!: { label: string; href: string }[];

  @Prop({ default: () => new Date() })
  createdAt!: Date;
}

export const ChatMessageEntrySchema = SchemaFactory.createForClass(ChatMessageEntry);

@Schema({ collection: 'chat_conversations', timestamps: { createdAt: true, updatedAt: true } })
export class ChatConversation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: [ChatMessageEntrySchema], default: [] })
  messages!: ChatMessageEntry[];
}

export type ChatConversationDocument = HydratedDocument<ChatConversation>;
export const ChatConversationSchema = SchemaFactory.createForClass(ChatConversation);

ChatConversationSchema.index({ userId: 1, updatedAt: -1 });

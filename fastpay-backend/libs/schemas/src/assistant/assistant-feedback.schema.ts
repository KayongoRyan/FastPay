import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ collection: 'assistant_feedback', timestamps: { createdAt: true, updatedAt: false } })
export class AssistantFeedback {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop()
  conversationId?: string;

  @Prop({ required: true })
  messageId!: string;

  @Prop({ required: true, enum: [1, -1] })
  rating!: 1 | -1;

  @Prop({ required: true })
  intent!: string;

  @Prop({ required: true })
  confidence!: number;

  @Prop({ type: [String], default: [] })
  chunkIds!: string[];

  @Prop({ required: true, enum: ['local', 'cloud'] })
  engine!: 'local' | 'cloud';

  @Prop()
  comment?: string;
}

export type AssistantFeedbackDocument = HydratedDocument<AssistantFeedback>;
export const AssistantFeedbackSchema = SchemaFactory.createForClass(AssistantFeedback);

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  KnowledgeChunk,
  KnowledgeChunkDocument,
  KnowledgeChunkScope,
} from '@fastpay/schemas';

import { cosineSimilarity } from '../common/assistant.utils';
import { EmbedderService } from './embedder.service';

export interface RetrievedChunk {
  id: string;
  text: string;
  source: string;
  title?: string;
  route?: string;
  actionRoute?: string;
  score: number;
  category: string;
}

@Injectable()
export class RetrieverService {
  constructor(
    @InjectModel(KnowledgeChunk.name)
    private readonly chunkModel: Model<KnowledgeChunkDocument>,
    private readonly embedder: EmbedderService,
  ) {}

  async retrieve(params: {
    query: string;
    userId?: string;
    topK: number;
    currentRoute?: string;
    includeUserScope?: boolean;
  }): Promise<RetrievedChunk[]> {
    const queryEmbedding = await this.embedder.embed(params.query);
    const scopes: KnowledgeChunkScope[] = [KnowledgeChunkScope.GLOBAL];

    if (params.includeUserScope && params.userId) {
      scopes.push(KnowledgeChunkScope.USER);
    }

    const chunks = await this.chunkModel
      .find({
        scope: { $in: scopes },
        ...(params.userId
          ? {
              $or: [
                { scope: KnowledgeChunkScope.GLOBAL },
                {
                  scope: KnowledgeChunkScope.USER,
                  userId: new Types.ObjectId(params.userId),
                },
              ],
            }
          : { scope: KnowledgeChunkScope.GLOBAL }),
      })
      .lean()
      .exec();

    const scored = chunks
      .map((chunk) => {
        let score = cosineSimilarity(queryEmbedding, chunk.embedding);
        if (params.currentRoute && chunk.route === params.currentRoute) {
          score += 0.15;
        }
        if (
          params.currentRoute &&
          chunk.route &&
          params.currentRoute.includes(chunk.route)
        ) {
          score += 0.08;
        }
        return {
          id: String(chunk._id),
          text: chunk.text,
          source: chunk.source,
          title: chunk.title,
          route: chunk.route,
          actionRoute: chunk.actionRoute,
          score,
          category: chunk.category,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, params.topK);

    return scored;
  }
}

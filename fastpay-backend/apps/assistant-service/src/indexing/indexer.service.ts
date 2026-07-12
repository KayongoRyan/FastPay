import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  KnowledgeChunk,
  KnowledgeChunkCategory,
  KnowledgeChunkDocument,
  KnowledgeChunkScope,
} from '@fastpay/schemas';

import { buildChunkKey } from '../common/assistant.utils';
import { EmbedderService } from '../retrieval/embedder.service';

export interface CorpusChunkInput {
  text: string;
  source: string;
  title?: string;
  route?: string;
  actionRoute?: string;
  category: KnowledgeChunkCategory | string;
}

@Injectable()
export class StaticCorpusParserService {
  loadCorpusFile(): CorpusChunkInput[] {
    const corpusPath = join(process.cwd(), 'corpus', 'static.json');
    if (!existsSync(corpusPath)) {
      return [];
    }

    const raw = readFileSync(corpusPath, 'utf8');
    const parsed = JSON.parse(raw) as CorpusChunkInput[];
    return parsed.filter((chunk) => chunk.text?.trim());
  }
}

@Injectable()
export class IndexerService {
  constructor(
    @InjectModel(KnowledgeChunk.name)
    private readonly chunkModel: Model<KnowledgeChunkDocument>,
    private readonly embedder: EmbedderService,
    private readonly corpusParser: StaticCorpusParserService,
  ) {}

  async rebuildGlobalIndex(): Promise<{ indexed: number }> {
    const corpus = this.corpusParser.loadCorpusFile();
    let indexed = 0;

    for (const item of corpus) {
      const text = item.text.trim();
      const embedding = await this.embedder.embed(text);
      const chunkKey = buildChunkKey({
        scope: KnowledgeChunkScope.GLOBAL,
        source: item.source,
        text,
      });

      await this.chunkModel.findOneAndUpdate(
        { chunkKey },
        {
          chunkKey,
          text,
          embedding,
          scope: KnowledgeChunkScope.GLOBAL,
          source: item.source,
          title: item.title,
          route: item.route,
          actionRoute: item.actionRoute,
          category: this.normalizeCategory(item.category),
        },
        { upsert: true, new: true },
      );
      indexed += 1;
    }

    return { indexed };
  }

  async upsertUserChunks(
    userId: string,
    chunks: CorpusChunkInput[],
  ): Promise<{ indexed: number }> {
    let indexed = 0;

    for (const item of chunks) {
      const text = item.text.trim();
      const embedding = await this.embedder.embed(text);
      const chunkKey = buildChunkKey({
        scope: KnowledgeChunkScope.USER,
        source: item.source,
        userId,
        text,
      });

      await this.chunkModel.findOneAndUpdate(
        { chunkKey },
        {
          chunkKey,
          text,
          embedding,
          scope: KnowledgeChunkScope.USER,
          userId: new Types.ObjectId(userId),
          source: item.source,
          title: item.title,
          route: item.route,
          actionRoute: item.actionRoute,
          category: this.normalizeCategory(item.category),
        },
        { upsert: true, new: true },
      );
      indexed += 1;
    }

    return { indexed };
  }

  private normalizeCategory(category: string): KnowledgeChunkCategory {
    const values = Object.values(KnowledgeChunkCategory);
    if (values.includes(category as KnowledgeChunkCategory)) {
      return category as KnowledgeChunkCategory;
    }
    return KnowledgeChunkCategory.POLICY;
  }
}

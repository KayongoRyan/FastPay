import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  KnowledgeChunk,
  KnowledgeChunkDocument,
  KnowledgeChunkScope,
} from '@fastpay/schemas';

import { IndexerService } from '../indexing/indexer.service';

@Injectable()
export class StartupIndexerService implements OnModuleInit {
  private readonly logger = new Logger(StartupIndexerService.name);

  constructor(
    @InjectModel(KnowledgeChunk.name)
    private readonly chunkModel: Model<KnowledgeChunkDocument>,
    private readonly indexer: IndexerService,
  ) {}

  async onModuleInit() {
    const globalCount = await this.chunkModel.countDocuments({
      scope: KnowledgeChunkScope.GLOBAL,
    });

    if (globalCount > 0) {
      return;
    }

    const result = await this.indexer.rebuildGlobalIndex();
    this.logger.log(`Indexed ${result.indexed} global knowledge chunks on startup`);
  }
}

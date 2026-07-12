import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { localEmbed } from '../common/assistant.utils';

@Injectable()
export class EmbedderService {
  constructor(private readonly configService: ConfigService) {}

  async embed(text: string): Promise<number[]> {
    const apiKey = this.configService.get<string>('assistant.openAiApiKey');
    const model = this.configService.getOrThrow<string>('assistant.embeddingModel');
    const dims = this.configService.getOrThrow<number>('assistant.localEmbeddingDims');

    if (!apiKey) {
      return localEmbed(text, dims);
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, input: text }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Embedding API failed (${response.status}): ${errorText}`);
    }

    const body = (await response.json()) as {
      data: { embedding: number[] }[];
    };

    return body.data[0]?.embedding ?? localEmbed(text, dims);
  }

  async embedMany(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((text) => this.embed(text)));
  }
}

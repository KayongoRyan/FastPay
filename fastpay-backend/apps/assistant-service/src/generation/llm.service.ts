import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { RetrievedChunk } from '../retrieval/retriever.service';

export interface BudgetSnapshot {
  monthlyIncomeRwf?: number;
  spendPercent?: number;
  savingsPercent?: number;
  goals?: { name: string; targetRwf?: number; savedRwf?: number; deadline?: string }[];
  familyPlan?: {
    yearlyIncomePercent?: number;
    children?: { label: string; lockYears?: number; savedRwf?: number }[];
  };
}

export interface ClientContext {
  currentRoute?: string;
  walletBalanceRwf?: string;
  walletBalanceUsdt?: string;
  cryptoPortfolioSummary?: string;
  engagementSummary?: string;
  budgetSnapshot?: BudgetSnapshot;
}

export interface LlmResponse {
  reply: string;
  sources: { title: string; source: string; route?: string }[];
  actions: { label: string; href: string }[];
}

@Injectable()
export class PromptBuilderService {
  buildSystemPrompt(): string {
    return [
      'You are FastPay Assistant, a helpful support agent for the FastPay fintech wallet in Rwanda.',
      'Answer ONLY using the provided context chunks. If the context is insufficient, say you are not sure and suggest opening the relevant FastPay screen.',
      'Never invent fees, exchange rates, balances, or account details.',
      'Do not provide regulated financial advice; include a brief disclaimer when discussing savings or loans.',
      'Return valid JSON with keys: reply (string), sources (array of {title, source, route?}), actions (array of {label, href}).',
      'Only suggest actions when a matching route exists in the context actionRoute fields.',
      'Refuse requests for other users data.',
    ].join(' ');
  }

  buildUserPrompt(params: {
    message: string;
    chunks: RetrievedChunk[];
    budgetSnapshot?: BudgetSnapshot;
    currentRoute?: string;
    walletBalanceRwf?: string;
    walletBalanceUsdt?: string;
    cryptoPortfolioSummary?: string;
    engagementSummary?: string;
  }): string {
    const context = params.chunks
      .map(
        (chunk, index) =>
          `[${index + 1}] title=${chunk.title ?? 'Untitled'} source=${chunk.source} route=${chunk.route ?? ''} actionRoute=${chunk.actionRoute ?? ''}\n${chunk.text}`,
      )
      .join('\n\n');

    const budgetSection = params.budgetSnapshot
      ? `\n\nUser budget snapshot (from client, treat as authoritative for this user):\n${JSON.stringify(params.budgetSnapshot, null, 2)}`
      : '';

    const walletSection = [
      params.walletBalanceRwf ? `Balance RWF: ${params.walletBalanceRwf}` : '',
      params.walletBalanceUsdt ? `Balance USDT: ${params.walletBalanceUsdt}` : '',
      params.cryptoPortfolioSummary
        ? `Portfolio: ${params.cryptoPortfolioSummary}`
        : '',
      params.engagementSummary
        ? `Engagement: ${params.engagementSummary}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    const userFactsSection = walletSection
      ? `\n\nUser facts (from client, authoritative):\n${walletSection}`
      : '';

    return [
      `User question: ${params.message}`,
      params.currentRoute ? `Current screen: ${params.currentRoute}` : '',
      'Context chunks:',
      context || '(no context retrieved)',
      budgetSection,
      userFactsSection,
      'Respond in JSON only.',
    ]
      .filter(Boolean)
      .join('\n\n');
  }
}

@Injectable()
export class LlmService {
  constructor(
    private readonly configService: ConfigService,
    private readonly promptBuilder: PromptBuilderService,
  ) {}

  async generate(params: {
    message: string;
    chunks: RetrievedChunk[];
    budgetSnapshot?: BudgetSnapshot;
    currentRoute?: string;
    walletBalanceRwf?: string;
    walletBalanceUsdt?: string;
    cryptoPortfolioSummary?: string;
    engagementSummary?: string;
  }): Promise<LlmResponse> {
    const apiKey = this.configService.get<string>('assistant.openAiApiKey');
    const fallbackEnabled = this.configService.get<boolean>('assistant.fallbackEnabled');

    if (!apiKey) {
      if (!fallbackEnabled) {
        throw new Error('OPENAI_API_KEY is not configured');
      }
      return this.fallbackGenerate(params);
    }

    try {
      const model = this.configService.getOrThrow<string>('assistant.llmModel');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: this.promptBuilder.buildSystemPrompt() },
            {
              role: 'user',
              content: this.promptBuilder.buildUserPrompt(params),
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LLM API failed (${response.status}): ${errorText}`);
      }

      const body = (await response.json()) as {
        choices: { message: { content: string } }[];
      };
      const content = body.choices[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(content) as Partial<LlmResponse>;

      return {
        reply:
          parsed.reply ??
          'I could not generate a response. Please try again or open the relevant FastPay screen.',
        sources: this.normalizeSources(parsed.sources, params.chunks),
        actions: this.normalizeActions(parsed.actions, params.chunks),
      };
    } catch {
      if (!fallbackEnabled) {
        throw new Error('LLM request failed');
      }
      return this.fallbackGenerate(params);
    }
  }

  private fallbackGenerate(params: {
    message: string;
    chunks: RetrievedChunk[];
    budgetSnapshot?: BudgetSnapshot;
  }): LlmResponse {
    const top = params.chunks.slice(0, 3);
    const lines = top.map((chunk) => `• ${chunk.title ?? chunk.source}: ${chunk.text}`);

    let reply = '';
    if (top.length === 0) {
      reply =
        'I do not have enough FastPay documentation loaded to answer that yet. Try asking about transfers, bills, savings, loans, or KYC.';
    } else {
      reply = [
        'Here is what I found in FastPay:',
        ...lines,
        '',
        'This is general product guidance, not personal financial advice.',
      ].join('\n');
    }

    if (params.budgetSnapshot?.goals?.length) {
      const behind = params.budgetSnapshot.goals.filter(
        (goal) =>
          (goal.savedRwf ?? 0) < ((goal.targetRwf ?? 0) > 0 ? (goal.targetRwf ?? 0) * 0.5 : 1),
      );
      if (behind.length > 0) {
        reply += `\n\nFrom your budget snapshot, ${behind.length} goal(s) are below 50% progress. Open Analytics → Goals to review.`;
      }
    }

    return {
      reply,
      sources: top.map((chunk) => ({
        title: chunk.title ?? chunk.source,
        source: chunk.source,
        route: chunk.route,
      })),
      actions: top
        .filter((chunk) => chunk.actionRoute)
        .slice(0, 2)
        .map((chunk) => ({
          label: `Open ${chunk.title ?? 'screen'}`,
          href: chunk.actionRoute!,
        })),
    };
  }

  private normalizeSources(
    sources: LlmResponse['sources'] | undefined,
    chunks: RetrievedChunk[],
  ): LlmResponse['sources'] {
    if (sources?.length) {
      return sources;
    }
    return chunks.slice(0, 3).map((chunk) => ({
      title: chunk.title ?? chunk.source,
      source: chunk.source,
      route: chunk.route,
    }));
  }

  private normalizeActions(
    actions: LlmResponse['actions'] | undefined,
    chunks: RetrievedChunk[],
  ): LlmResponse['actions'] {
    if (actions?.length) {
      return actions;
    }
    return chunks
      .filter((chunk) => chunk.actionRoute)
      .slice(0, 2)
      .map((chunk) => ({
        label: `Go to ${chunk.title ?? 'feature'}`,
        href: chunk.actionRoute!,
      }));
  }
}

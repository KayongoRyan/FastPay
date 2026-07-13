import { Injectable } from '@nestjs/common';

export interface RetrievalMeta {
  maxScore: number;
  scoreGap: number;
  chunkCount: number;
}

export interface ValidationResult {
  ok: boolean;
  reasons: string[];
  downgradedConfidence: boolean;
  strippedActions: number;
  refused: boolean;
}

const ALLOWED_HREFS = new Set([
  '/wallet',
  '/wallet/transfer',
  '/wallet/receive',
  '/buy',
  '/bills',
  '/analytics',
  '/analytics?mode=goals',
  '/settings',
  '/support',
  '/(auth)/kyc',
  '/forgot-passcode',
  '/loan/apply',
  '/irembo',
  '/offline/receive',
  '/services/family-setup',
  '/services/family-wallet',
  '/services/bill',
  '/services/escrow',
  '/services/insurance-plans',
  '/services/voucher',
  '/convert',
  '/bank-pay',
  '/login',
]);

const REFUSAL_CONFIDENCE = 0.4;

export interface ValidatedReply {
  reply: string;
  sources: { title: string; source: string; route?: string }[];
  actions: { label: string; href: string }[];
  confidence: number;
  validation: ValidationResult;
}

@Injectable()
export class AnswerValidatorService {
  validate(params: {
    reply: string;
    sources: { title: string; source: string; route?: string }[];
    actions: { label: string; href: string }[];
    confidence?: number;
    walletBalanceRwf?: string;
    walletBalanceUsdt?: string;
    corpusWasRetrieved?: boolean;
    usedLlm?: boolean;
  }): ValidatedReply {
    const reasons: string[] = [];
    let confidence = params.confidence ?? 0.75;
    let downgraded = false;
    let stripped = 0;
    let text = params.reply;
    let actions = [...params.actions];
    let sources = [...params.sources];
    let refused = false;

    if (
      /\b(balance|rwf|usdt|holdings|portfolio)\b/i.test(text) &&
      !params.walletBalanceRwf &&
      !params.walletBalanceUsdt
    ) {
      if (
        /\d/.test(text) ||
        /estimated balance/i.test(text) ||
        /portfolio:/i.test(text)
      ) {
        text =
          "Open Wallet to refresh your balance — I don't have a current figure yet.";
        sources = [{ title: 'Wallet', source: 'cloud/wallet', route: '/wallet' }];
        actions = [{ label: 'Open Wallet', href: '/wallet' }];
        reasons.push('balance_guard');
        confidence = Math.min(confidence, 0.5);
      }
    }

    const kept: { label: string; href: string }[] = [];
    for (const action of actions) {
      if (this.hrefAllowed(action.href)) {
        kept.push(action);
      } else {
        stripped += 1;
        reasons.push(`stripped_action:${action.href}`);
      }
    }
    actions = kept;

    if (params.corpusWasRetrieved && !sources.length && !params.usedLlm) {
      confidence *= 0.6;
      downgraded = true;
      reasons.push('ungrounded_template');
    }

    if (confidence < REFUSAL_CONFIDENCE) {
      text =
        "I'm not sure I have a reliable answer for that. Try rephrasing, or open one of these screens.";
      sources = [{ title: 'Support', source: 'cloud/refusal' }];
      actions = [
        { label: 'Open Wallet', href: '/wallet' },
        { label: 'Open Support', href: '/support' },
        { label: 'Open Analytics', href: '/analytics' },
      ];
      confidence = Math.min(confidence, REFUSAL_CONFIDENCE - 0.01);
      refused = true;
      reasons.push('low_confidence_refusal');
    }

    return {
      reply: text,
      sources,
      actions,
      confidence,
      validation: {
        ok: !refused && stripped === 0 && !downgraded,
        reasons,
        downgradedConfidence: downgraded,
        strippedActions: stripped,
        refused,
      },
    };
  }

  private hrefAllowed(href: string): boolean {
    if (ALLOWED_HREFS.has(href)) {
      return true;
    }
    const base = href.split('?')[0];
    if (ALLOWED_HREFS.has(base)) {
      return true;
    }
    if (!href.startsWith('/')) {
      return false;
    }
    const root = base.split('/').filter(Boolean)[0];
    return [
      'wallet',
      'buy',
      'bills',
      'analytics',
      'settings',
      'support',
      'loan',
      'irembo',
      'offline',
      'services',
      'convert',
      'bank-pay',
      'forgot-passcode',
      '(auth)',
      'login',
    ].includes(root);
  }
}

export function computeRetrievalMeta(
  scores: number[],
): RetrievalMeta {
  if (!scores.length) {
    return { maxScore: 0, scoreGap: 0, chunkCount: 0 };
  }
  const peak = Math.max(...scores);
  const norm = peak <= 0 ? scores.map(() => 0) : scores.map((s) => s / peak);
  const maxScore = norm[0] ?? 0;
  const scoreGap = norm.length > 1 ? norm[0] - norm[1] : maxScore;
  return { maxScore, scoreGap, chunkCount: scores.length };
}

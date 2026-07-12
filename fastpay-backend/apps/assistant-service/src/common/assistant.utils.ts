export function redactPii(text: string): string {
  return text
    .replace(/\+?25[0-9]{9,10}/g, (match) => {
      const digits = match.replace(/\D/g, '');
      return digits.slice(0, 3) + '***' + digits.slice(-3);
    })
    .replace(/\b0?7[0-9]{8}\b/g, (match) => match.slice(0, 3) + '***' + match.slice(-3))
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[email]')
    .replace(/\b\d{16}\b/g, '[card]')
    .replace(/\bTIN[:\s]*[A-Z0-9-]+\b/gi, 'TIN [redacted]');
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < len; i++) {
    dot += a[i]! * b[i]!;
    magA += a[i]! * a[i]!;
    magB += b[i]! * b[i]!;
  }

  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

export function localEmbed(text: string, dims = 256): number[] {
  const vec = new Array<number>(dims).fill(0);
  const tokens = text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

  for (const token of tokens) {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = (hash * 31 + token.charCodeAt(i)) >>> 0;
    }
    vec[hash % dims]! += 1;
    vec[(hash >> 8) % dims]! += 0.5;
  }

  const magnitude = Math.sqrt(vec.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vec.map((value) => value / magnitude);
}

export function buildChunkKey(parts: {
  scope: string;
  source: string;
  userId?: string;
  text: string;
}): string {
  const base = `${parts.scope}:${parts.userId ?? 'global'}:${parts.source}`;
  let hash = 0;
  for (let i = 0; i < parts.text.length; i++) {
    hash = (hash * 31 + parts.text.charCodeAt(i)) >>> 0;
  }
  return `${base}:${hash.toString(16)}`;
}

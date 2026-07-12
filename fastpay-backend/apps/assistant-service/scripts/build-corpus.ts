import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, join, relative } from 'node:path';

type CorpusChunk = {
  text: string;
  source: string;
  title?: string;
  route?: string;
  actionRoute?: string;
  category: string;
};

const ROOT = join(__dirname, '..', '..', '..', '..');
const FASTPAY_APP = join(ROOT, 'FastPay');
const OUTPUT_DIR = join(__dirname, '..', 'corpus');
const OUTPUT_FILE = join(OUTPUT_DIR, 'static.json');

function extractProp(content: string, prop: string): string | undefined {
  const patterns = [
    new RegExp(`${prop}=\\{?["'\`]([^"'\`}]+)["'\`]\\}?`, 'm'),
    new RegExp(`${prop}=\\{"([^"]+)"\\}`, 'm'),
    new RegExp(`${prop}=\\{'([^']+)'\\}`, 'm'),
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return undefined;
}

function extractStringBlocks(content: string, blockName: string): string[] {
  const blocks: string[] = [];
  const blockRegex = new RegExp(`<${blockName}[^>]*>([\\s\\S]*?)</${blockName}>`, 'g');
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(content)) !== null) {
    blocks.push(match[1] ?? '');
  }

  return blocks;
}

function extractSteps(content: string): string[] {
  const steps: string[] = [];
  const stepRegex = /title:\s*["'`]([^"'`]+)["'`][\s\S]*?detail:\s*["'`]([^"'`]+)["'`]/g;
  let match: RegExpExecArray | null;

  while ((match = stepRegex.exec(content)) !== null) {
    steps.push(`${match[1]}: ${match[2]}`);
  }

  return steps;
}

function extractHighlights(content: string): string[] {
  const items: string[] = [];
  const itemRegex = /title:\s*["'`]([^"'`]+)["'`][\s\S]*?detail:\s*["'`]([^"'`]+)["'`]/g;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(content)) !== null) {
    items.push(`${match[1]} — ${match[2]}`);
  }

  return items;
}

function extractInfoLines(content: string): string[] {
  const panelBlocks = extractStringBlocks(content, 'FeatureInfoPanel');
  const lines: string[] = [];

  for (const block of panelBlocks) {
    const lineRegex = /["'`]([^"'`]+)["'`]/g;
    let match: RegExpExecArray | null;
    while ((match = lineRegex.exec(block)) !== null) {
      const line = match[1]?.trim();
      if (line && line.length > 8 && !line.includes('title')) {
        lines.push(line);
      }
    }
  }

  return lines;
}

function routeFromPath(filePath: string): string {
  const rel = relative(join(FASTPAY_APP, 'app', '(main)'), filePath)
    .replace(/\\/g, '/')
    .replace(/\.tsx$/, '');

  if (rel === 'index') {
    return '/';
  }

  if (rel.endsWith('/index')) {
    return `/${rel.replace(/\/index$/, '')}`;
  }

  return `/${rel}`;
}

function categoryFromPath(filePath: string): string {
  if (filePath.includes('quick-links')) {
    return 'quicklink';
  }
  if (filePath.includes('services')) {
    return 'service';
  }
  if (filePath.includes('loan')) {
    return 'service';
  }
  if (filePath.includes('irembo')) {
    return 'quicklink';
  }
  if (filePath.includes('kyc')) {
    return 'kyc';
  }
  return 'policy';
}

function parseFeaturePage(filePath: string): CorpusChunk[] {
  const content = readFileSync(filePath, 'utf8');
  const title = extractProp(content, 'title');
  const headline = extractProp(content, 'headline');
  const description = extractProp(content, 'description');
  const tag = extractProp(content, 'tag');
  const route = routeFromPath(filePath);
  const source = relative(FASTPAY_APP, filePath).replace(/\\/g, '/');
  const category = categoryFromPath(filePath);

  const parts = [
    title ? `${title}` : undefined,
    tag ? `[${tag}]` : undefined,
    headline,
    description,
  ].filter(Boolean);

  const steps = extractSteps(content);
  if (steps.length) {
    parts.push(`Steps: ${steps.join('; ')}`);
  }

  const highlights = extractHighlights(content);
  if (highlights.length) {
    parts.push(`Options: ${highlights.join('; ')}`);
  }

  const infoLines = extractInfoLines(content);
  if (infoLines.length) {
    parts.push(`Notes: ${infoLines.join('; ')}`);
  }

  const text = parts.join('\n');
  if (!text.trim()) {
    return [];
  }

  return [
    {
      text,
      source,
      title: title ?? headline,
      route,
      category,
    },
  ];
}

function collectTsxFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];

  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...collectTsxFiles(full));
    } else if (entry.endsWith('.tsx') && !entry.startsWith('_')) {
      files.push(full);
    }
  }

  return files;
}

function parseCatalogData(): CorpusChunk[] {
  const chunks: CorpusChunk[] = [];

  const servicesData = readFileSync(
    join(FASTPAY_APP, 'lib', 'services', 'data.ts'),
    'utf8',
  );
  const serviceRegex = /id:\s*"([^"]+)"[\s\S]*?label:\s*"([^"]+)"[\s\S]*?href:\s*"([^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = serviceRegex.exec(servicesData)) !== null) {
    chunks.push({
      text: `FastPay service ${match[2]} (${match[1]}). Open at ${match[3]}.`,
      source: 'lib/services/data.ts',
      title: match[2],
      route: match[3],
      actionRoute: match[3],
      category: 'service',
    });
  }

  const quickLinksData = readFileSync(
    join(FASTPAY_APP, 'lib', 'quick-links', 'data.ts'),
    'utf8',
  );
  const quickRegex = /id:\s*"([^"]+)"[\s\S]*?label:\s*"([^"]+)"[\s\S]*?href:\s*"([^"]+)"/g;
  while ((match = quickRegex.exec(quickLinksData)) !== null) {
    chunks.push({
      text: `FastPay quick link ${match[2]} (${match[1]}). Open at ${match[3]}.`,
      source: 'lib/quick-links/data.ts',
      title: match[2],
      route: match[3],
      actionRoute: match[3],
      category: 'quicklink',
    });
  }

  const routesFile = readFileSync(
    join(FASTPAY_APP, 'lib', 'navigation', 'feature-routes.ts'),
    'utf8',
  );
  const routeRegex = /(\w+):\s*"([^"]+)"/g;
  while ((match = routeRegex.exec(routesFile)) !== null) {
    if (match[1] === 'withQuery') {
      continue;
    }
    chunks.push({
      text: `FastPay action ${match[1]} routes to ${match[2]}.`,
      source: 'lib/navigation/feature-routes.ts',
      title: match[1],
      actionRoute: match[2],
      category: 'policy',
    });
  }

  return chunks;
}

function main() {
  const dirs = [
    join(FASTPAY_APP, 'app', '(main)', 'services'),
    join(FASTPAY_APP, 'app', '(main)', 'quick-links'),
    join(FASTPAY_APP, 'app', '(main)', 'loan'),
    join(FASTPAY_APP, 'app', '(main)', 'irembo'),
    join(FASTPAY_APP, 'app', '(auth)'),
  ];

  const pageChunks = dirs.flatMap((dir) => {
    if (!statSync(dir, { throwIfNoEntry: false })) {
      return [];
    }
    return collectTsxFiles(dir).flatMap(parseFeaturePage);
  });

  const catalogChunks = parseCatalogData();
  const all = [...pageChunks, ...catalogChunks];

  const deduped = new Map<string, CorpusChunk>();
  for (const chunk of all) {
    deduped.set(`${chunk.source}:${chunk.text.slice(0, 80)}`, chunk);
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const output = [...deduped.values()];
  writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');

  console.log(`Wrote ${output.length} corpus chunks to ${OUTPUT_FILE}`);
  console.log(`Sample: ${basename(OUTPUT_FILE)} first title = ${output[0]?.title ?? 'n/a'}`);
}

main();

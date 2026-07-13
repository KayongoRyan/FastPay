import * as fs from "node:fs";
import * as path from "node:path";

const root = path.resolve(__dirname, "..");
const source = path.resolve(
  root,
  "../fastpay-backend/apps/assistant-service/corpus/static.json",
);
const target = path.resolve(root, "assets/corpus/local-corpus.json");

if (!fs.existsSync(source)) {
  console.error(`Source corpus not found: ${source}`);
  process.exit(1);
}

const raw = fs.readFileSync(source, "utf8");
const chunks = JSON.parse(raw) as Record<string, unknown>[];

const minified = chunks.map((chunk) => ({
  text: String(chunk.text ?? ""),
  source: String(chunk.source ?? ""),
  title: String(chunk.title ?? ""),
  route: chunk.route ? String(chunk.route) : undefined,
  category: chunk.category ? String(chunk.category) : undefined,
  actionRoute: chunk.actionRoute ? String(chunk.actionRoute) : undefined,
}));

fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, JSON.stringify(minified, null, 0));
console.log(`Synced ${minified.length} chunks → ${target}`);

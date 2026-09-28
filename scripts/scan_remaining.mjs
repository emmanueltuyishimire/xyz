import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.astro', 'scripts']);
const EXTENSIONS = new Set(['.astro', '.md', '.ts', '.css']);

function walk(dir, results = []) {
  let items;
  try { items = fs.readdirSync(dir); } catch { return results; }
  for (const item of items) {
    const full = path.join(dir, item);
    let stat;
    try { stat = fs.statSync(full); } catch { continue; }
    if (stat.isDirectory()) {
      if (!SKIP_DIRS.has(item)) walk(full, results);
    } else if (EXTENSIONS.has(path.extname(item))) {
      results.push(full);
    }
  }
  return results;
}

// Pattern: two consecutive high-latin bytes that are mojibake sequences
const mojibakePat = /[\u00c0-\u00ff][\u0080-\u00bf]/;

const files = walk(path.join(ROOT, 'src'));
const hits = [];

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (mojibakePat.test(line)) {
      const matches = line.match(/[\u00c0-\u00ff][\u0080-\u00bf][^\s<"'=]*/g) || [];
      hits.push(`${path.relative(ROOT, f)}:L${i + 1}: ${matches.join(' | ')} :: ${line.trim().slice(0, 100)}`);
    }
  });
}

console.log('Remaining mojibake hits: ' + hits.length);
hits.slice(0, 60).forEach(h => console.log(h));

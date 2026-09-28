/**
 * fix_mojibake_pass3.mjs
 * Third-pass targeted fix — handles the stubborn cases that require
 * exact literal string matching rather than byte-level regex.
 *
 * Root cause: Node.js fs.readFileSync('utf8') internally decodes bytes
 * to JavaScript strings (UTF-16 internally), so regex on raw byte patterns
 * don't always match. We use replaceAll() with the actual rendered mojibake
 * strings here.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Map of EXACT visible mojibake string → correct replacement
// Keys are the broken strings as they appear in the files when read as UTF-8
const LITERAL_MAP = [
  // ❌ Red X (U+274C) — appears as âŒ
  ['âŒ', '❌'],

  // ÷ Division sign (U+00F7) — appears as Ã·
  ['Ã·', '÷'],

  // ½ Vulgar fraction half (U+00BD) — appears as Â½
  ['Â½', '½'],

  // · Middle dot (U+00B7) — appears as Â·
  ['Â·', '·'],

  // ⏱ (U+23F1 Stopwatch) — appears as â±
  ['â±', '⏱'],

  // ⏳ (U+23F3 Hourglass) — appears as â³
  ['â³', '⏳'],

  // ❓ (U+2753 Question Mark) — appears as â"
  ['â"', '❓'],

  // 💡 Light bulb (U+1F4A1) — appears as â€™Â¡ remainder after prior pass
  ['€™Â¡', '💡'],

  // Remaining âÂÅ' triple corruption for ❌
  ["â\u00c2\u00c5\u2019", '❌'],
  ['âÂÅ\u2019', '❌'],

  // Ã¯Â¸Â remaining variation selector stripping
  ['Ã¯Â¸Â', ''],
  
  // Â¡ stray (inverted exclamation leftover)
  ['Â¡', ''],

  // ÂÅ' (partial corruption double)
  ['ÂÅ\u2019', '❌'],

  // â± stopwatch variants
  ['â±\uFE0F', '⏱'],

  // Stray  Â alone before space
  ['Â ', ' '],
];

const SKIP_DIRS  = new Set(['node_modules', '.git', 'dist', '.astro', 'scripts']);
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

const files = walk(path.join(ROOT, 'src'));
const changed = [];

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  let content = original;

  for (const [bad, good] of LITERAL_MAP) {
    if (content.includes(bad)) {
      content = content.split(bad).join(good);
    }
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changed.push(path.relative(ROOT, file));
  }
}

console.log('\n✅ Pass 3 complete');
console.log(`   Changed: ${changed.length} file(s)`);
changed.forEach(f => console.log('  ' + f));

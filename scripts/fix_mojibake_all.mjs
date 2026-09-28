/**
 * fix_mojibake_all.mjs
 * Scans all .astro, .md, .ts, .css files in src/ and fixes
 * UTF-8 mojibake (double-encoded characters) back to their correct Unicode.
 *
 * Run: node scripts/fix_mojibake_all.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ─────────────────────────────────────────────────────────────────────────────
// REPLACEMENT MAP
// Pattern → correct Unicode character(s)
// Order matters: longer/more-specific patterns first.
// ─────────────────────────────────────────────────────────────────────────────
const REPLACEMENTS = [
  // ── Directional / "Smart" Quotes ──────────────────────────────────────────
  [/\u00e2\u0080\u009c/g, '\u201C'],   // â€œ  →  " (left double quote)
  [/\u00e2\u0080\u009d/g, '\u201D'],   // â€   →  " (right double quote)
  [/\u00e2\u0080\u0098/g, '\u2018'],   // â€˜  →  ' (left single quote)
  [/\u00e2\u0080\u0099/g, '\u2019'],   // â€™  →  ' (right single quote)

  // ── Dashes ────────────────────────────────────────────────────────────────
  [/\u00e2\u0080\u0094/g, '\u2014'],   // â€"  →  — (em dash)
  [/\u00e2\u0080\u0093/g, '\u2013'],   // â€"  →  – (en dash)

  // ── Arrows ────────────────────────────────────────────────────────────────
  [/\u00e2\u0086\u0092/g, '\u2192'],   // â†'  →  → (right arrow)
  [/\u00e2\u0086\u0090/g, '\u2190'],   // â†  →  ← (left arrow)
  [/\u00e2\u0086\u0091/g, '\u2191'],   // â†'  →  ↑ (up arrow)
  [/\u00e2\u0086\u0093/g, '\u2193'],   // â†"  →  ↓ (down arrow)

  // ── Bullets / List Markers ────────────────────────────────────────────────
  [/\u00e2\u0080\u00a2/g, '\u2022'],   // â€¢  →  • (bullet)
  [/\u00e2\u0080\u00b3/g, '\u2033'],   // â€³  →  ″ (double prime)

  // ── Ellipsis ──────────────────────────────────────────────────────────────
  [/\u00e2\u0080\u00a6/g, '\u2026'],   // â€¦  →  … (horizontal ellipsis)

  // ── Trademark / Copyright ─────────────────────────────────────────────────
  [/\u00e2\u0084\u00a2/g, '\u2122'],   // â„¢  →  ™ (trademark)
  [/\u00c2\u00ae/g,       '\u00AE'],   // Â®   →  ® (registered)
  [/\u00c2\u00a9/g,       '\u00A9'],   // Â©   →  © (copyright)

  // ── Non-breaking space ────────────────────────────────────────────────────
  [/\u00c2\u00a0/g, '\u00A0'],         // Â    →  &nbsp;

  // ── Degree / Section ──────────────────────────────────────────────────────
  [/\u00c2\u00b0/g, '\u00B0'],         // Â°   →  °
  [/\u00c2\u00a7/g, '\u00A7'],         // Â§   →  §

  // ── Latin accented letters (common in author names etc.) ──────────────────
  [/\u00c3\u00a9/g, '\u00E9'],         // Ã©   →  é
  [/\u00c3\u00a8/g, '\u00E8'],         // Ã¨   →  è
  [/\u00c3\u00aa/g, '\u00EA'],         // Ãª   →  ê
  [/\u00c3\u00a0/g, '\u00E0'],         // Ã    →  à
  [/\u00c3\u00a2/g, '\u00E2'],         // Ã¢   →  â
  [/\u00c3\u00b4/g, '\u00F4'],         // Ã´   →  ô
  [/\u00c3\u00bc/g, '\u00FC'],         // Ã¼   →  ü
  [/\u00c3\u009f/g, '\u00DF'],         // Ã   →  ß
  [/\u00c3\u00b1/g, '\u00F1'],         // Ã±   →  ñ

  // ── Mathematical / Currency ───────────────────────────────────────────────
  [/\u00e2\u0089\u00a4/g, '\u2264'],   // â‰¤  →  ≤
  [/\u00e2\u0089\u00a5/g, '\u2265'],   // â‰¥  →  ≥
  [/\u00c2\u00a3/g,       '\u00A3'],   // Â£   →  £
  [/\u00e2\u0082\u00ac/g, '\u20AC'],   // â‚¬  →  €
  [/\u00c2\u00b1/g,       '\u00B1'],   // Â±   →  ±

  // ── Checkmarks / Stars (common in callout boxes) ──────────────────────────
  [/\u00e2\u009c\u0093/g, '\u2713'],   // â"  →  ✓
  [/\u00e2\u009c\u0094/g, '\u2714'],   // â"  →  ✔
  [/\u00e2\u009c\u0098/g, '\u2718'],   // â"  →  ✘
  [/\u00e2\u0098\u0085/g, '\u2605'],   // â˜…  →  ★
  [/\u00e2\u0098\u0086/g, '\u2606'],   // â˜†  →  ☆

  // ── Warning / Info symbols ────────────────────────────────────────────────
  [/\u00e2\u0080\u00bc/g, '\u203C'],   // â€¼  →  ‼
  [/\u00e2\u0084\u00b9/g, '\u2139'],   // â„¹  →  ℹ

  // ── Broken emoji sequences (4-byte UTF-8 misread) ─────────────────────────
  // Replace broken multi-byte emoji sequences with nothing (they can't be recovered)
  [/\u00f0[\u0080-\u00bf][\u0080-\u00bf][\u0080-\u00bf]/g, ''],

  // ── Stray isolated Â that remains after above cleanup ────────────────────
  [/\u00c2(?=\s)/g, ''],

  // ── Stray isolated â€ that remains (broken quote prefix) ─────────────────
  // Only strip if followed by nothing useful
  [/\u00e2\u0080(?!\u009c|\u009d|\u0098|\u0099|\u0094|\u0093|\u00a2|\u00a6|\u00bc)/g, ''],
];

const EXTENSIONS = new Set(['.astro', '.md', '.ts', '.css', '.js', '.json']);
const SKIP_DIRS  = new Set(['node_modules', '.git', 'dist', '.astro', '.cache', 'scripts']);

// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
function fixContent(content) {
  let result = content;
  for (const [pattern, replacement] of REPLACEMENTS) {
    result = result.replace(pattern, replacement);
    // Reset lastIndex for global regex (safety)
    if (pattern.global) pattern.lastIndex = 0;
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
const srcDir = path.join(ROOT, 'src');
const files  = walk(srcDir);

const changed = [];
let unchanged = 0;

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  const fixed    = fixContent(original);
  if (fixed !== original) {
    fs.writeFileSync(file, fixed, 'utf8');
    changed.push(path.relative(ROOT, file));
  } else {
    unchanged++;
  }
}

console.log(`\n✅ Mojibake fix complete`);
console.log(`   Changed : ${changed.length} file(s)`);
console.log(`   Clean   : ${unchanged} file(s)`);
if (changed.length) {
  console.log('\nModified files:');
  changed.forEach(f => console.log('  ' + f));
}

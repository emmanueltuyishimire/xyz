/**
 * fix_mojibake_pass2.mjs
 * Second-pass targeted fix for remaining mojibake in specific files.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Additional replacements discovered in second scan
const PASS2 = [
  // âŒ → ❌  (U+274C Red X cross mark)  — broken 4-byte emoji
  [/\u00e2\u00cc/g, '\u274C'],  // partial match
  // Full broken ❌ sequence: F0 9F 8C 90 -> âŒ in mojibake: â (e2) Œ (8c) 
  // The actual hex for ❌ in UTF-8 is E2 9D 8C
  // So mojibake is: Ã¢\u009d\u008c -> but Node reads these differently
  // Let's use the visible string pattern
  [/â\u008c/g, '\u274C'],    // âŒ
  
  // 🛕 (U+1F6D5 Hindu Temple emoji) — broken in about.astro
  // The visible mojibake for broken emoji: ðŸ›ï¸ 
  // Replace broken emoji wrappers around icons with SVG-safe alternatives
  // For about.astro coverage icon: just remove
  
  // Ã· → ÷ (U+00F7 division sign)
  [/\u00c3\u00b7/g, '\u00F7'],   // Ã·  →  ÷

  // Â½ → ½ (U+00BD vulgar fraction one half)
  [/\u00c2\u00bd/g, '\u00BD'],   // Â½  →  ½

  // Â· → · (U+00B7 middle dot / interpunct)
  [/\u00c2\u00b7/g, '\u00B7'],   // Â·  →  ·

  // ï¸ (variation selector-16 FE0F in mojibake)
  [/\u00ef\u00b8\u008f/g, ''],   // Remove VS16 marker

  // Ã°Å¸ ... (broken 4-byte emoji start sequences) - replace with empty
  [/\u00c3\u00b0\u00c5\u00b8[\u0080-\u00ff]{0,6}/g, ''],  // ðŸ... broken emoji

  // Å¡ (remaining Å sequences)
  [/\u00c5\u00a1/g, '\u0161'],   // š
  [/\u00c5\u00b8/g, '\u0178'],   // Ÿ

  // ÂÅ' sequences (check mark) - this is âŒ (cross) which is U+274C
  // The mojibake sequence: â (e2) Â (c2) Å' (c5 92) seems like double corruption
  // Try replacing the visible string:
  [/\u00e2\u00c2\u00c5\u0092/g, '\u274C'],   // âÂÅ' → ❌

  // Ã°Å¸â€™Â¡ → 💡 (light bulb emoji) - triple corrupted
  [/\u00c3\u00b0\u00c5\u00b8\u00e2\u0080\u0099\u00c2\u00a1/g, '💡'],

  // Ã°Å¸â€œâ€" → 📘 (blue book emoji)  
  [/\u00c3\u00b0\u00c5\u00b8\u00e2\u0080\u009c\u00e2\u0080\u0093/g, '📘'],

  // Ã¯Â¸Â → ️ (variation selector) - strip
  [/\u00c3\u00af\u00c2\u00b8\u00c2/g, ''],
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

  // Apply pass-2 replacements
  for (const [pat, rep] of PASS2) {
    content = content.replace(pat, rep);
    if (pat.global) pat.lastIndex = 0;
  }

  // Special targeted replacements using exact string literals
  // (handles cases where byte-level patterns miss due to Node encoding)
  
  // âŒ (the visible string for ❌)
  content = content.replaceAll('âŒ', '❌');
  
  // Ã· (visible for ÷)
  content = content.replaceAll('Ã·', '÷');
  
  // Â½ (visible for ½)
  content = content.replaceAll('Â½', '½');
  
  // Â· (visible for ·)
  content = content.replaceAll('Â·', '·');
  
  // ï¸ (visible for variation selector - strip)
  content = content.replaceAll('ï¸', '');
  
  // Ã°Å¸â€™Â¡ (visible for 💡)
  content = content.replaceAll('Ã°Å¸â€™Â¡', '💡');
  
  // Ã°Å¸â€œâ€" (visible for 📘)
  content = content.replaceAll('Ã°Å¸â€œâ€"', '📘');

  // Ã°Å¸â€™â€" (visible for 📕)
  content = content.replaceAll('Ã°Å¸â€™â€"', '📕');

  // ðŸ›ï¸ (broken temple emoji in about.astro - replace with building SVG text)
  content = content.replaceAll('ðŸ›ï¸', '🏛️');

  // âÂÅ' (broken ❌ double-encoding)
  content = content.replaceAll('âÂÅ\u2019', '❌');

  // Å¸ remaining
  content = content.replaceAll('Å¸', 'Ÿ');
  
  // Ã¯Â¸Â (variation selector combo - strip)
  content = content.replaceAll('Ã¯Â¸Â', '');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changed.push(path.relative(ROOT, file));
  }
}

console.log('\n✅ Pass 2 complete');
console.log(`   Changed: ${changed.length} file(s)`);
changed.forEach(f => console.log('  ' + f));

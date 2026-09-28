import fs from 'fs';
import path from 'path';

function walk(dir, out = []) {
  for (const item of fs.readdirSync(dir)) {
    if (['node_modules', '.git', 'dist', '.astro'].includes(item)) continue;
    const full = path.join(dir, item);
    const s = fs.statSync(full);
    if (s.isDirectory()) walk(full, out);
    else if (['.astro', '.css', '.md', '.ts', '.html', '.json'].some(ext => item.endsWith(ext))) out.push(full);
  }
  return out;
}

const files = walk('src');

// The sequence is: \u00e2\u009d\u0152 (UTF-8 bytes of ❌ U+274C decoded as Windows-1252/Latin-1)
// E2 9D 8C -> \u00e2 \u009d \u0152 (0x8C is Œ in windows-1252 which is U+0152 in JS Unicode string)
const targetSeq = '\u00e2\u009d\u0152';

let replacedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. Replace the exact sequence with ❌
  if (content.includes(targetSeq)) {
    content = content.replaceAll(targetSeq, '❌');
  }

  // 2. Also handle double corrupted variants in medicare-and-you-2026.md
  content = content.replaceAll('â\u0080\u0094', '—');
  content = content.replaceAll('ââ‚¬"', '—');
  content = content.replaceAll('âÅ“—¦', '✅');
  content = content.replaceAll('â Å’', '❌');
  content = content.replaceAll('â\u0080\u009c', '"');
  content = content.replaceAll('â\u0080\u009d', '"');
  content = content.replaceAll('â\u0080\u0098', "'");
  content = content.replaceAll('â\u0080\u0099', "'");
  
  // Specific symbols remaining in tools/pages
  content = content.replaceAll('â ±', '⏱');
  content = content.replaceAll('â “', '❓');
  content = content.replaceAll('â ³', '⏳');
  content = content.replaceAll('â˜ ', '☐');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    replacedCount++;
    console.log(`Replaced in ${file}`);
  }
}

console.log(`Done. Cleaned ${replacedCount} files.`);

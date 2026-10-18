import fs from 'fs';
import path from 'path';

const targetTerms = ['22,320', '59,520', '23,400', '62,160', '1,545', '2,088', '2,163', '18,000'];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.astro' || file === 'PRODUCTS') continue;
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(full));
    } else if (file.endsWith('.astro') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

const allFiles = walk('src');
const hits = [];

for (const f of allFiles) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    for (const t of targetTerms) {
      if (l.includes(t)) {
        // filter 18,000 to gift tax or standalone
        const isExcludedIRMAA = t === '18,000' && (l.includes('218,000') || l.includes('118,000') || l.includes('318,000')) && !l.includes(' 18,000') && !l.includes('$18,000') && !l.includes('18,000 per');
        if (!isExcludedIRMAA) {
          hits.push({ file: f.replace(/\\/g, '/'), line: i + 1, term: t, text: l.trim() });
        }
      }
    }
  }
}

console.log(`Found ${hits.length} matches:`);
for (const h of hits) {
  console.log(`[${h.term}] ${h.file}:${h.line} -> ${h.text}`);
}

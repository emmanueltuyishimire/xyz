import fs from 'fs';
import path from 'path';

function walk(dir, out = []) {
  for (const item of fs.readdirSync(dir)) {
    if (['node_modules', '.git', 'dist', '.astro', 'scripts'].includes(item)) continue;
    const full = path.join(dir, item);
    const s = fs.statSync(full);
    if (s.isDirectory()) walk(full, out);
    else if (['.astro', '.css'].some(ext => item.endsWith(ext))) out.push(full);
  }
  return out;
}

const files = walk('src');

const matches = [];

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    const l = line.toLowerCase();
    if (
      (l.includes('background') || l.includes('bg-')) &&
      (l.includes('green') || l.includes('teal') || l.includes('#f0fff4') || l.includes('#e6fffa') || l.includes('#d4edda') || l.includes('#c6f6d5') || l.includes('var(--color-primary') || l.includes('var(--color-success'))
    ) {
      matches.push({ file: f, line: idx + 1, text: line.trim() });
    }
  });
}

console.log(`Found ${matches.length} lines in astro/css files.`);
matches.forEach(m => console.log(`${m.file}:${m.line} ${m.text.slice(0, 120)}`));

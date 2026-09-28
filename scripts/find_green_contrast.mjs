import fs from 'fs';
import path from 'path';

function walk(dir, out = []) {
  for (const item of fs.readdirSync(dir)) {
    if (['node_modules', '.git', 'dist', '.astro', 'scripts'].includes(item)) continue;
    const full = path.join(dir, item);
    const s = fs.statSync(full);
    if (s.isDirectory()) walk(full, out);
    else if (['.astro', '.css', '.md'].some(ext => item.endsWith(ext))) out.push(full);
  }
  return out;
}

const files = walk('src');

// Search for green backgrounds in hex, rgb, or hsl
const greenBgRegex = /background(?:-color)?\s*:\s*(#[0-9a-f]{3,8}|rgba?\([^)]+\)|hsl\([^)]+\)|var\(--color-[^)]+\))/gi;

const matches = [];

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    // Check for green-looking background values or success backgrounds
    if (
      line.includes('#F0FFF4') ||
      line.includes('#f0fff4') ||
      line.includes('#E6FFFA') ||
      line.includes('#e6fffa') ||
      line.includes('#D4EDDA') ||
      line.includes('#d4edda') ||
      line.includes('#C6F6D5') ||
      line.includes('#c6f6d5') ||
      line.includes('#DEF7EC') ||
      line.includes('#def7ec') ||
      line.includes('#E8F5E9') ||
      line.includes('#e8f5e9') ||
      line.includes('#22A866') ||
      line.includes('#1A7A4E') ||
      line.includes('#38A169') ||
      line.includes('#276749') ||
      line.includes('var(--color-success') ||
      line.includes('var(--color-primary') && line.includes('background')
    ) {
      matches.push({ file: f, line: idx + 1, text: line.trim() });
    }
  });
}

console.log(`Found ${matches.length} lines with green/success backgrounds or colors.`);
matches.slice(0, 50).forEach(m => console.log(`${m.file}:${m.line} ${m.text.slice(0, 120)}`));

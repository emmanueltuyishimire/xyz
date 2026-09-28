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

const suspiciousPatterns = [
  { name: 'ðŸ (emoji corruption)', regex: /ðŸ[^\s<>"']*/g },
  { name: 'â€ (quote/dash corruption)', regex: /â€[^\s<>"']*/g },
  { name: 'â† (arrow corruption)', regex: /â†[^\s<>"']*/g },
  { name: 'â˜ / âœ (symbol corruption)', regex: /â[˜œš][^\s<>"']*/g },
  { name: 'Ã (accent corruption)', regex: /Ã[^\s<>"']*/g },
  { name: 'Â (extra latin-1 prefix)', regex: /Â[^\s<>"']*/g },
  { name: 'general mojibake (ð, â, Ã, Â)', regex: /[\u00e0-\u00ef][\u0080-\u00bf]{1,3}/g }
];

const report = {};

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, lineNum) => {
    // Check for ðŸ specifically or other suspicious characters
    if (line.includes('ð') || line.includes('â') || line.includes('Ã') || line.includes('Â')) {
      if (!report[file]) report[file] = [];
      report[file].push({
        lineNum: lineNum + 1,
        text: line.trim()
      });
    }
  });
}

console.log(`Files with suspicious characters: ${Object.keys(report).length}\n`);

for (const [file, items] of Object.entries(report)) {
  console.log(`=== ${file} (${items.length} lines) ===`);
  items.slice(0, 10).forEach(it => {
    console.log(`  L${it.lineNum}: ${it.text.slice(0, 100)}`);
  });
}

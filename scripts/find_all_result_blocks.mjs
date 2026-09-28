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
const resultBlockFiles = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('-result-block') || content.includes('#f0fff4') || content.includes('#F0FFF4')) {
    resultBlockFiles.push(file);
  }
}

console.log(`Found ${resultBlockFiles.length} files with result-block or #f0fff4:`);
resultBlockFiles.forEach(f => console.log('  ' + f));

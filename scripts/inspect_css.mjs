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

// Search for files containing both dark blue and green keywords or classes
const results = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  // Check global.css specifically
  if (file.endsWith('global.css')) {
    console.log('--- Scanning global.css ---');
    const lines = content.split('\n');
    lines.forEach((l, idx) => {
      if (l.includes('success') || l.includes('green') || l.includes('teal') || l.includes('alert') || l.includes('callout')) {
        console.log(`L${idx+1}: ${l.trim()}`);
      }
    });
  }
}

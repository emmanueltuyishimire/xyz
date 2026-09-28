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

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  
  // Look for style="..." with green background and dark text color
  const inlineMatches = content.matchAll(/style="([^"]*background[^"]*)"/gi);
  for (const m of inlineMatches) {
    const s = m[1].toLowerCase();
    if (
      s.includes('green') ||
      s.includes('#0a3d3a') ||
      s.includes('#072e2b') ||
      s.includes('#1a7a4e') ||
      s.includes('#276749') ||
      s.includes('#38a169') ||
      s.includes('#0a6b3a') ||
      s.includes('#f0fff4') ||
      s.includes('#dcfce7') ||
      s.includes('#e6fffa') ||
      s.includes('#ebf4f3')
    ) {
      if (
        s.includes('#0d2137') ||
        s.includes('#08111f') ||
        s.includes('navy') ||
        s.includes('#1e293b') ||
        s.includes('#111827') ||
        s.includes('#333') ||
        s.includes('color:#0a3d3a')
      ) {
        console.log(`${file}: inline combo -> ${m[0]}`);
      }
    }
  }
}

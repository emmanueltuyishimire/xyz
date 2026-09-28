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

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  // Check any CSS selector with badge, tag, pill, result, or callout
  const matches = content.matchAll(/\.([a-zA-Z0-9_-]*(?:badge|tag|pill|result|callout|box|card)[a-zA-Z0-9_-]*)\s*\{([^}]+)\}/gi);
  for (const m of matches) {
    const sel = m[1];
    const body = m[2].toLowerCase();
    if (
      body.includes('background') &&
      (body.includes('green') || body.includes('teal') || body.includes('#0a3d3a') || body.includes('#f0fff4') || body.includes('#ebf4f3') || body.includes('#e6fffa') || body.includes('#dcfce7') || body.includes('#e6f4ed'))
    ) {
      if (body.includes('color')) {
        console.log(`${file} .${sel} -> ${body.replace(/\s+/g, ' ')}`);
      }
    }
  }
}

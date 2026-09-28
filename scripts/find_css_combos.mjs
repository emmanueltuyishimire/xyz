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
  
  // Extract CSS blocks
  const cssMatches = content.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  const blocks = file.endsWith('.css') ? [content] : Array.from(cssMatches, m => m[1]);
  
  for (const block of blocks) {
    // Look for rules that set background to green/teal or dark-mode rules that set text or background
    // Match selectors and their body: selector { body }
    const ruleMatches = block.matchAll(/([^{]+)\{([^}]+)\}/g);
    for (const rm of ruleMatches) {
      const sel = rm[1].trim();
      const body = rm[2].toLowerCase();
      
      const hasGreenBg = 
        body.includes('background') && (
          body.includes('green') ||
          body.includes('#0a3d3a') ||
          body.includes('#1a7a4e') ||
          body.includes('#22a866') ||
          body.includes('#38a169') ||
          body.includes('#276749') ||
          body.includes('#0a6b3a') ||
          body.includes('#ebf4f3') ||
          body.includes('#e6fffa') ||
          body.includes('#f0fff4') ||
          body.includes('#dcfce7') ||
          body.includes('#e6f4ed') ||
          body.includes('var(--color-primary') ||
          body.includes('var(--color-success') ||
          body.includes('var(--teal')
        );

      if (hasGreenBg) {
        // Check what color is set
        if (
          body.includes('color:') && (
            body.includes('#0d2137') ||
            body.includes('#08111f') ||
            body.includes('navy') ||
            body.includes('#0a3d3a') ||
            body.includes('#1e293b') ||
            body.includes('#111827') ||
            body.includes('#1a2640') ||
            body.includes('var(--color-text') ||
            body.includes('var(--color-primary')
          )
        ) {
          console.log(`${file} [${sel}]:\n  ${rm[2].trim().replace(/\s+/g, ' ')}\n`);
        }
      }
    }
  }
}

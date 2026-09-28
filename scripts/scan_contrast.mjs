/**
 * scan_contrast.mjs
 * Finds potentially low-contrast color combinations in source files.
 * Reports hardcoded green/teal backgrounds with dark-text on them.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SKIP = new Set(['node_modules', '.git', 'dist', '.astro', 'scripts']);
const EXTS = new Set(['.astro', '.md', '.ts', '.css']);

// Patterns to flag
const PATTERNS = [
  // green backgrounds used in the site
  { label: 'bg:#F0FFF4 (light green)',  re: /background(?:-color)?\s*:\s*#F0FFF4/gi },
  { label: 'bg:#38A169 (medium green)', re: /background(?:-color)?\s*:\s*#38A169/gi },
  { label: 'bg:#276749 (dark green)',   re: /background(?:-color)?\s*:\s*#276749/gi },
  { label: 'bg:#22A866 (success green)',re: /background(?:-color)?\s*:\s*#22A866/gi },
  { label: 'bg:#1A7A4E (success)',      re: /background(?:-color)?\s*:\s*#1A7A4E/gi },
  // color:dark-blue on above backgrounds
  { label: 'color:#276749',            re: /(?<!background-)color\s*:\s*#276749/gi },
  { label: 'color:#0D2137',            re: /(?<!background-)color\s*:\s*#0D2137/gi },
  { label: 'color:#0A3D3A',            re: /(?<!background-)color\s*:\s*#0A3D3A/gi },
  // dark mode teal
  { label: 'color:#1DB8A8 (dark-teal)',re: /(?<!background-)color\s*:\s*#1DB8A8/gi },
];

function walk(dir, out = []) {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (SKIP.has(item)) continue;
    const s = fs.statSync(full);
    if (s.isDirectory()) walk(full, out);
    else if (EXTS.has(path.extname(item))) out.push(full);
  }
  return out;
}

const files = walk(path.join(ROOT, 'src'));
const report = {};

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  const rel = path.relative(ROOT, f);
  for (const { label, re } of PATTERNS) {
    re.lastIndex = 0;
    lines.forEach((line, i) => {
      re.lastIndex = 0;
      if (re.test(line)) {
        if (!report[label]) report[label] = [];
        report[label].push(`${rel}:L${i+1}: ${line.trim().slice(0, 100)}`);
      }
    });
  }
}

for (const [label, hits] of Object.entries(report)) {
  console.log(`\n=== ${label} (${hits.length} occurrences) ===`);
  hits.slice(0, 5).forEach(h => console.log('  ' + h));
  if (hits.length > 5) console.log(`  ... and ${hits.length - 5} more`);
}
console.log('\nDone.');

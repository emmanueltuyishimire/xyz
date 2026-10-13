import fs from 'fs';
import path from 'path';

function scanAll(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) scanAll(full);
    else if (/\.(astro|tsx?|jsx?|md)$/.test(entry.name)) {
      const txt = fs.readFileSync(full, 'utf8');
      if (txt.includes('62,160') || txt.includes('62160') || txt.includes('5,180') || txt.includes('5180')) {
        console.log(`Match in: ${full}`);
      }
    }
  }
}

scanAll('src');

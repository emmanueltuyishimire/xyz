import fs from 'fs';
import path from 'path';

const results = [];

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(full);
    } else if (/\.(astro|tsx?|jsx?|md)$/.test(entry.name)) {
      const lines = fs.readFileSync(full, 'utf8').split('\n');
      lines.forEach((line, idx) => {
        // Look for 2024 or 2025 specifically in regulatory / benefit contexts
        if (/(2024|2025)/.test(line)) {
          // Exclude typical historical references or standard copyright
          if (!line.includes('copyright') && !line.includes('Copyright') && !line.includes('DHCS') && !line.includes('MAGI')) {
            results.push({ file: full, line: idx + 1, text: line.trim() });
          }
        }
      });
    }
  }
}

scanDir('src');
console.log(`Found ${results.length} lines with 2024/2025 references.`);
fs.writeFileSync('scripts/year_scan_results.json', JSON.stringify(results.slice(0, 100), null, 2), 'utf8');

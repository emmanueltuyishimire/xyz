import fs from 'fs';
import path from 'path';

const dirs = ['src', 'public'];
const patterns = [/simon/i, /uwumukiza/i];
const matches = [];

function scan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scan(full);
    } else if (/\.(astro|tsx?|jsx?|json|html|md|ya?ml|toml)$/.test(entry.name)) {
      const lines = fs.readFileSync(full, 'utf8').split('\n');
      lines.forEach((line, idx) => {
        for (const p of patterns) {
          if (p.test(line)) {
            matches.push({ file: full, line: idx + 1, text: line.trim() });
            break;
          }
        }
      });
    }
  }
}

for (const d of dirs) {
  if (fs.existsSync(d)) scan(d);
}

// Also check netlify.toml
const netlifyLines = fs.readFileSync('netlify.toml', 'utf8').split('\n');
netlifyLines.forEach((line, idx) => {
  for (const p of patterns) {
    if (p.test(line)) {
      matches.push({ file: 'netlify.toml', line: idx + 1, text: line.trim() });
      break;
    }
  }
});

console.log(`Found ${matches.length} mentions of Simon/UWUMUKIZA.`);
console.log(JSON.stringify(matches, null, 2));

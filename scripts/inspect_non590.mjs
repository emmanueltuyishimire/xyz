import fs from 'fs';
const data = JSON.parse(fs.readFileSync('scripts/stale_grep_results.json', 'utf-8'));
const non590 = data.filter(d => !d.label.includes('590'));
for (const d of non590) {
  console.log(`[${d.label}] ${d.file}:${d.line}`);
  console.log(`   ${d.text}`);
}

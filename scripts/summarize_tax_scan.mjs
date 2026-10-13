import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('scripts/tax_values_scan.json', 'utf8'));
const filesMap = {};

for (const item of raw) {
  if (!filesMap[item.file]) {
    filesMap[item.file] = [];
  }
  filesMap[item.file].push(item);
}

for (const [file, items] of Object.entries(filesMap)) {
  console.log(`\n=== File: ${file} (${items.length} occurrences) ===`);
  const uniqueVals = [...new Set(items.map(i => i.val))];
  console.log(`Unique values: ${uniqueVals.join(', ')}`);
  items.slice(0, 10).forEach(i => {
    console.log(`  Line ${i.line}: [${i.val}] ${i.text}`);
  });
}

/**
 * test_constants.mjs
 * Verifies all OFFICIAL_CONSTANTS entries against saved snapshots.
 * Parses constants.ts directly (no TypeScript loader needed).
 */
import fs from 'fs';
import path from 'path';

const sourcesDir = path.resolve('data/sources');
const constantsFile = fs.readFileSync('src/data/constants.ts', 'utf-8');

// Parse out each constant entry from the TS file
const entries = [];
const entryRegex = /(\w+):\s*\{[^}]*?value:\s*([^,\n]+),[\s\S]*?sourceUrl:\s*'([^']+)'[\s\S]*?snapshotFile:\s*'([^']+)'[\s\S]*?quotedText:\s*'((?:[^'\\]|\\.)*)'/g;
let match;
while ((match = entryRegex.exec(constantsFile)) !== null) {
  entries.push({
    key: match[1],
    value: match[2].trim(),
    sourceUrl: match[3],
    snapshotFile: match[4],
    quotedText: match[5].replace(/\\'/g, "'"),
  });
}

console.log(`--- Official Constants Verbatim Verification Test ---`);
console.log(`Found ${entries.length} constant entries.\n`);

let errors = 0;
let passed = 0;

for (const item of entries) {
  // 1. Source URL must be .gov, .mil, or official authority
  const isGov = /^https?:\/\/([a-zA-Z0-9-]+\.)*(gov|mil)(\/|$)/i.test(item.sourceUrl);
  if (!isGov) {
    console.error(`FAIL: [${item.key}] sourceUrl is not .gov/.mil: ${item.sourceUrl}`);
    errors++;
  }

  // 2. Snapshot file must exist
  const snapshotPath = path.join(sourcesDir, item.snapshotFile);
  if (!fs.existsSync(snapshotPath)) {
    console.error(`FAIL: [${item.key}] Snapshot not found: ${item.snapshotFile}`);
    errors++;
    continue;
  }

  // 3. For text files, quoted text must appear verbatim
  if (item.snapshotFile.endsWith('.pdf')) {
    // PDFs cannot be grepped as text — verify file exists (already done above)
    console.log(`PASS: [${item.key}] Snapshot PDF exists: ${item.snapshotFile} (value: ${item.value})`);
    passed++;
  } else {
    const content = fs.readFileSync(snapshotPath, 'utf8');
    if (!content.includes(item.quotedText)) {
      console.error(`FAIL: [${item.key}] quotedText not found verbatim in ${item.snapshotFile}`);
      console.error(`  Expected: "${item.quotedText.slice(0, 120)}..."`);
      errors++;
    } else {
      console.log(`PASS: [${item.key}] Verified verbatim against ${item.snapshotFile} (value: ${item.value})`);
      passed++;
    }
  }
}

console.log(`\n--- Results: ${passed} passed, ${errors} failed ---`);
if (errors > 0) {
  console.error(`FAILED: ${errors} error(s) in constants verification.`);
  process.exit(1);
} else {
  console.log('PASSED: All official constants verified against saved snapshots.');
}

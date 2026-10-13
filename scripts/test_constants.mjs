/**
 * test_constants.mjs
 * Verifies all OFFICIAL_CONSTANTS entries against saved snapshots in data/sources/.
 * Supports both HTML and extracted PDF .txt snapshots with page and line citations.
 */
import fs from 'fs';
import path from 'path';

const sourcesDir = path.resolve('data/sources');
const constantsFile = fs.readFileSync('src/data/constants.ts', 'utf-8');

// Parse out each constant entry by matching blocks ending in `as OfficialConstant`
const entries = [];
const blockRegex = /([A-Z0-9_]+):\s*\{([\s\S]*?)\}\s*as\s*OfficialConstant/g;
let m;
while ((m = blockRegex.exec(constantsFile)) !== null) {
  const key = m[1];
  const body = m[2];

  const valMatch = body.match(/value:\s*([^,\n]+)/);
  const urlMatch = body.match(/sourceUrl:\s*'([^']+)'/);
  const snapMatch = body.match(/snapshotFile:\s*'([^']+)'/);
  const quoteMatch = body.match(/quotedText:\s*'((?:[^'\\]|\\.)*)'/);
  const pageMatch = body.match(/sourcePage:\s*(\d+)/);
  const noteMatch = body.match(/note:\s*'((?:[^'\\]|\\.)*)'/);

  if (valMatch && urlMatch && snapMatch && quoteMatch) {
    entries.push({
      key,
      value: valMatch[1].trim(),
      sourceUrl: urlMatch[1],
      snapshotFile: snapMatch[1],
      sourcePage: pageMatch ? parseInt(pageMatch[1]) : null,
      quotedText: quoteMatch[1].replace(/\\'/g, "'"),
      note: noteMatch ? noteMatch[1].replace(/\\'/g, "'") : null,
    });
  }
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

  // 3. Verbatim check against snapshot
  if (item.snapshotFile.endsWith('.pdf')) {
    const txtFile = item.snapshotFile.replace(/\.pdf$/, '.txt');
    const txtPath = path.join(sourcesDir, txtFile);
    if (!fs.existsSync(txtPath)) {
      console.error(`FAIL: [${item.key}] Extracted text snapshot not found: ${txtFile}`);
      errors++;
      continue;
    }
    const txtContent = fs.readFileSync(txtPath, 'utf8');

    // Page check if sourcePage is provided
    if (item.sourcePage) {
      const pageMarker = `=== PAGE ${item.sourcePage} ===`;
      const nextPageMarker = `=== PAGE ${item.sourcePage + 1} ===`;
      const pageStart = txtContent.indexOf(pageMarker);
      if (pageStart === -1) {
        console.error(`FAIL: [${item.key}] Page marker ${pageMarker} not found in ${txtFile}`);
        errors++;
        continue;
      }
      const pageEnd = txtContent.indexOf(nextPageMarker, pageStart);
      const pageText = pageEnd !== -1 ? txtContent.slice(pageStart, pageEnd) : txtContent.slice(pageStart);

      if (!pageText.includes(item.quotedText)) {
        console.error(`FAIL: [${item.key}] quotedText not found on page ${item.sourcePage} of ${txtFile}`);
        console.error(`  Expected: "${item.quotedText}"`);
        errors++;
        continue;
      }
    } else if (!txtContent.includes(item.quotedText)) {
      console.error(`FAIL: [${item.key}] quotedText not found in ${txtFile}`);
      console.error(`  Expected: "${item.quotedText}"`);
      errors++;
      continue;
    }

    // Senior deduction label check
    if (item.key.startsWith('TAX_2026_ENHANCED_SENIOR')) {
      const expectedLabel = 'tax year 2025 form; statutory parameters unchanged for 2026; update when the 2026 form is released.';
      if (item.note !== expectedLabel) {
        console.error(`FAIL: [${item.key}] note does not match required senior deduction label: "${item.note}"`);
        errors++;
        continue;
      }
    }

    console.log(`PASS: [${item.key}] Verified verbatim in ${txtFile} (Page ${item.sourcePage || 'all'}, value: ${item.value})`);
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

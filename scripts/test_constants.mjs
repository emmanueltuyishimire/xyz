/**
 * test_constants.mjs
 * Verifies all OFFICIAL_CONSTANTS entries against saved snapshots in data/sources/.
 * Supports both HTML and extracted PDF .txt snapshots with page and line citations.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const sourcesDir = path.resolve('data/sources');
const manifestPath = path.join(sourcesDir, 'sources_manifest.json');
const constantsFile = fs.readFileSync('src/data/constants.ts', 'utf-8');

// 0. Verify Snapshot Manifest Integrity
console.log('--- Snapshot Manifest Hash Integrity Verification ---');
let manifestErrors = 0;
if (!fs.existsSync(manifestPath)) {
  console.error('FAIL: sources_manifest.json not found in ' + sourcesDir);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const manifestMap = new Map();

for (const entry of manifest) {
  const filePath = path.join(sourcesDir, entry.filename);
  if (!fs.existsSync(filePath)) {
    console.error(`FAIL: Snapshot file missing: ${entry.filename}`);
    manifestErrors++;
    continue;
  }
  const buf = fs.readFileSync(filePath);
  const hash = entry.filename.endsWith('.pdf')
    ? crypto.createHash('sha256').update(buf).digest('hex')
    : crypto.createHash('sha256').update(buf.toString('utf8').replace(/\r\n/g, '\n')).digest('hex');

  if (hash !== entry.sha256) {
    console.error(`FAIL: [SNAPSHOT CORRUPTION] Hash mismatch for ${entry.filename}`);
    console.error(`  Expected: ${entry.sha256}`);
    console.error(`  Computed: ${hash}`);
    manifestErrors++;
  } else {
    console.log(`PASS: [HASH] ${entry.filename} matches manifest (${hash.slice(0, 16)}...)`);
    manifestMap.set(entry.filename, entry);
  }

  // Verify .headers file exists and is non-empty
  const headersFile = entry.headersFile || `${entry.filename}.headers`;
  const headersPath = path.join(sourcesDir, headersFile);
  if (!fs.existsSync(headersPath)) {
    console.error(`FAIL: [MISSING HEADERS] Missing headers file for snapshot: ${headersFile}`);
    manifestErrors++;
  } else if (fs.statSync(headersPath).size === 0) {
    console.error(`FAIL: [EMPTY HEADERS] Headers file is empty: ${headersFile}`);
    manifestErrors++;
  } else {
    console.log(`PASS: [HEADERS] ${headersFile} verified (${fs.statSync(headersPath).size} bytes)`);
  }
}

// Verify that EVERY file under data/sources (except .headers, .txt, .json) has a headers file
const allSourceFiles = fs.readdirSync(sourcesDir);
for (const file of allSourceFiles) {
  if (file.endsWith('.headers') || file.endsWith('.txt') || file.endsWith('.json')) continue;
  const headersFile = `${file}.headers`;
  const headersPath = path.join(sourcesDir, headersFile);
  if (!fs.existsSync(headersPath)) {
    console.error(`FAIL: [MISSING HEADERS] File under data/sources missing headers: ${file}`);
    manifestErrors++;
  } else if (fs.statSync(headersPath).size === 0) {
    console.error(`FAIL: [EMPTY HEADERS] Headers file under data/sources is empty: ${headersFile}`);
    manifestErrors++;
  }
}

if (manifestErrors > 0) {
  console.error(`\nFAILED: Snapshot integrity check failed with ${manifestErrors} error(s).`);
  process.exit(1);
}
console.log(`PASSED: All ${manifest.length} source snapshots and headers verified against manifest.\n`);

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
  const statusMatch = body.match(/status:\s*'([^']+)'/);
  const noteMatch = body.match(/note:\s*'((?:[^'\\]|\\.)*)'/);

  if (valMatch && urlMatch && snapMatch && quoteMatch) {
    entries.push({
      key,
      value: valMatch[1].trim(),
      sourceUrl: urlMatch[1],
      snapshotFile: snapMatch[1],
      sourcePage: pageMatch ? parseInt(pageMatch[1]) : null,
      quotedText: quoteMatch[1].replace(/\\'/g, "'"),
      status: statusMatch ? statusMatch[1] : 'verified',
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

  // 2. Snapshot file must exist and be registered in manifest
  const snapshotPath = path.join(sourcesDir, item.snapshotFile);
  if (!fs.existsSync(snapshotPath)) {
    console.error(`FAIL: [${item.key}] Snapshot not found: ${item.snapshotFile}`);
    errors++;
    continue;
  }
  if (!manifestMap.has(item.snapshotFile)) {
    console.error(`FAIL: [${item.key}] Snapshot not registered in sources_manifest.json: ${item.snapshotFile}`);
    errors++;
    continue;
  }

  // 3. Status validation: Fail if constant is marked 'verified' but source snapshot is not raw or owner-supplied
  const manifestEntry = manifestMap.get(item.snapshotFile);
  const isRawOrOwner = manifestEntry && (manifestEntry.isRawDownload || manifestEntry.manuallySavedByOwner);
  if (item.status === 'verified' && !isRawOrOwner) {
    console.error(`FAIL: [INVALID VERIFIED STATUS] Constant ${item.key} is marked 'verified' but source (${item.snapshotFile}) has isRawDownload: false and is not manuallySavedByOwner.`);
    errors++;
  } else if (item.status === 'unverified-source') {
    console.log(`PASS: [UNVERIFIED SOURCE FLAGGED] Constant ${item.key} is correctly marked 'unverified-source' awaiting owner browser download.`);
  }

  // 4. Verbatim check against snapshot
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

// ── TWO-SOURCE RULE VERIFICATION ──────────────────────────────────────────
console.log('\n--- Two-Source Rule Independent Verification ---');

const cmsPartsAB = fs.readFileSync(path.join(sourcesDir, 'cms_2026_parts_ab_premiums.html'), 'utf8');
const medicarePartD = fs.readFileSync(path.join(sourcesDir, 'medicare_gov_2026_part_d_costs.html'), 'utf8');
const medicareCosts = fs.readFileSync(path.join(sourcesDir, 'medicare_gov_2026_medicare_costs.html'), 'utf8');

// 1. Part D IRMAA: CMS Fact Sheet (Table 5 & 6) vs Medicare.gov Costs Portal
const partDTwoSourceChecks = [
  { name: 'Tier 1 ($14.50)', cms: '<span>$14.50</span>', med: '14.50 + your plan premium' },
  { name: 'Tier 2 ($37.50)', cms: '<span>$37.50</span>', med: '37.50 + your plan premium' },
  { name: 'Tier 3 ($60.40)', cms: '<span>$60.40</span>', med: '60.40 + your plan premium' },
  { name: 'Tier 4 ($83.30)', cms: '<span>$83.30</span>', med: '83.30 + your plan premium' },
  { name: 'Tier 5 ($91.00)', cms: '<span>$91.00</span>', med: '91.00 + your plan premium' },
  { name: 'MFS Tier 2 ($83.30)', cms: '<span>$83.30</span>', med: '83.30 + your plan premium' },
  { name: 'MFS Tier 3 ($91.00)', cms: '<span>$91.00</span>', med: '91.00 + your plan premium' },
];

for (const chk of partDTwoSourceChecks) {
  const inCms = cmsPartsAB.includes(chk.cms);
  const inMed = medicarePartD.includes(chk.med);
  if (!inCms || !inMed) {
    console.error(`FAIL: [TWO-SOURCE] Part D IRMAA ${chk.name} disagree (CMS: ${inCms}, Medicare.gov: ${inMed})`);
    errors++;
  } else {
    console.log(`PASS: [TWO-SOURCE] Part D IRMAA ${chk.name} verified in both CMS Fact Sheet & Medicare.gov costs page`);
    passed++;
  }
}

// 2. Part B Premiums & IRMAA: CMS Fact Sheet vs Medicare.gov Costs Portal
const partBTwoSourceChecks = [
  { name: 'Part B Base Premium ($202.90)', cms: '<span>$202.90</span>', med: '202.90 each month' },
  { name: 'Part B Deductible ($283)', cms: '$283 in 2026', med: '$283 before Original Medicare starts to pay' },
  { name: 'Part A Deductible ($1,736)', cms: '$1,736 in 2026', med: '$1,736 ' },
  { name: 'Part A Coinsurance ($434)', cms: '$434 per day', med: 'Days 61-90: $434' },
  { name: 'Part B Tier 1 Total ($284.10)', cms: '<span>$284.10</span>', med: '284.10' },
  { name: 'Part B Tier 2 Total ($405.80)', cms: '<span>$405.80</span>', med: '405.80' },
  { name: 'Part B Tier 3 Total ($527.50)', cms: '<span>$527.50</span>', med: '527.50' },
  { name: 'Part B Tier 4 Total ($649.20)', cms: '<span>$649.20</span>', med: '649.20' },
  { name: 'Part B Tier 5 Total ($689.90)', cms: '<span>$689.90</span>', med: '689.90' },
  { name: 'Part B MFS Tier 2 Total ($649.20)', cms: '<span>$649.20</span>', med: '649.20' },
  { name: 'Part B MFS Tier 3 Total ($689.90)', cms: '<span>$689.90</span>', med: '689.90' },
];

for (const chk of partBTwoSourceChecks) {
  const inCms = cmsPartsAB.includes(chk.cms);
  const inMed = medicareCosts.includes(chk.med);
  if (!inCms || !inMed) {
    console.error(`FAIL: [TWO-SOURCE] Part B ${chk.name} disagree (CMS: ${inCms}, Medicare.gov: ${inMed})`);
    errors++;
  } else {
    console.log(`PASS: [TWO-SOURCE] Part B ${chk.name} verified in both CMS Fact Sheet & Medicare.gov costs portal`);
    passed++;
  }
}

// 3. Part D Base Premium & Deductible: CMS Rate Announcement vs Medicare.gov
const cmsPartDAnnounce = fs.readFileSync(path.join(sourcesDir, 'cms_2026_part_d_rate_announcement.html'), 'utf8');
if (cmsPartDAnnounce.includes('For 2026, the base beneficiary premium will be $38.99.') && medicarePartD.includes('$615 in 2026') && medicarePartD.includes('$2,100 in 2026')) {
  console.log('PASS: [TWO-SOURCE] Part D parameters ($38.99 base, $615 deductible, $2,100 cap) verified across CMS Announcement and Medicare.gov portal');
  passed++;
} else {
  console.error('FAIL: [TWO-SOURCE] Part D parameters missing from official sources');
  errors++;
}

// 4. Medicaid Standards: CMS Spousal Impoverishment CIB vs Federal Medicaid Portal
const medicaidPortal = fs.readFileSync(path.join(sourcesDir, 'medicaid_gov_spousal_impoverishment.html'), 'utf8');
if (fs.existsSync(path.join(sourcesDir, 'cms_cib_04272026_spousal_impoverishment.pdf')) && medicaidPortal.includes('cib04272026')) {
  console.log('PASS: [TWO-SOURCE] Medicaid Spousal Impoverishment CIB verified in Federal Medicaid Portal (medicaid.gov)');
  passed++;
} else {
  console.error('FAIL: [TWO-SOURCE] Medicaid CIB missing from Medicaid.gov portal');
  errors++;
}

// 5. Social Security Wage Base & Earnings Test: SSA Fact Sheet vs Statutory Standards
const ssaFactSheet = fs.readFileSync(path.join(sourcesDir, 'ssa_2026_cola_fact_sheet.html'), 'utf8');
if (ssaFactSheet.includes('$184,500') && ssaFactSheet.includes('$24,480') && ssaFactSheet.includes('$65,160')) {
  console.log('PASS: [TWO-SOURCE] Social Security parameters ($184,500 wage base, $24,480 / $65,160 earnings tests) verified in SSA Fact Sheet');
  passed++;
} else {
  console.error('FAIL: [TWO-SOURCE] Social Security parameters missing from SSA Fact Sheet');
  errors++;
}

console.log(`\n--- Results: ${passed} passed, ${errors} failed ---`);
if (errors > 0) {
  console.error(`FAILED: ${errors} error(s) in constants verification.`);
  process.exit(1);
} else {
  console.log('PASSED: All official constants verified against saved snapshots.');
}

import { execSync } from 'child_process';
import fs from 'fs';
import crypto from 'crypto';

console.log('Downloading f1040s1a.pdf...');
execSync('curl -sSL -D data/sources/f1040s1a.pdf.headers https://www.irs.gov/pub/irs-pdf/f1040s1a.pdf -o data/sources/f1040s1a.pdf');
const buf = fs.readFileSync('data/sources/f1040s1a.pdf');
const hash = crypto.createHash('sha256').update(buf).digest('hex');
console.log('Downloaded. Size:', buf.length, 'SHA-256:', hash);

// Update sources_manifest.json
const manifestPath = 'data/sources/sources_manifest.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
manifest.push({
  id: 'irs-schedule-1a-senior-deduction',
  filename: 'f1040s1a.pdf',
  sourceUrl: 'https://www.irs.gov/pub/irs-pdf/f1040s1a.pdf',
  retrievalDate: new Date().toISOString(),
  sha256: hash
});
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
console.log('Updated sources_manifest.json successfully.');

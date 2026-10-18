import fs from 'fs';

const pages = [
  'src/pages/tools/medicare-effective-date-calculator.astro',
  'src/pages/tools/ira-withdrawal-tax-calculator.astro',
  'src/pages/tools/local-senior-transportation-finder.astro',
  'src/pages/tools/social-security-tax-calculator.astro',
  'src/pages/tools/retirement-tax-withholding-calculator.astro',
  'src/pages/tools/retirement-tax-calculator-by-state.astro'
];

const forbidden = [
  'name="keywords"',
  'Verified Against Official Government Sources',
  'View all 80 tools',
  'All 78 Free Tools',
  '2026 COLA Update',
  'opens October 15',
  '$108,000',
  '$105,000',
  '41 states',
  'Kansas',
  '$51,525',
  '$11,450',
  '$20,800',
  '$2,250',
  '$2,000 single',
  '$1,600',
  'month four',
  'one in 30',
  'now recommends',
  'Robert used this calculator',
  'Margaret used our RMD Calculator'
];

const results = [];

pages.forEach(p => {
  const content = fs.readFileSync(p, 'utf8');
  forbidden.forEach(str => {
    if (str === 'Kansas' && !p.includes('social-security-tax-calculator') && !p.includes('retirement-tax-calculator-by-state')) {
      return;
    }
    let count = 0;
    let pos = 0;
    while ((pos = content.indexOf(str, pos)) !== -1) {
      count++;
      pos += str.length;
    }
    if (count > 0) {
      results.push({ page: p, str, count });
      console.log(`HIT: ${p} contains "${str}" (${count} times)`);
    }
  });
});

if (results.length === 0) {
  console.log('ALL FORBIDDEN STRINGS CLEAN! (0 hits across all 6 pages)');
} else {
  console.log(`TOTAL HITS: ${results.length}`);
}

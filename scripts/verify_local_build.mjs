import fs from 'node:fs';
import path from 'node:path';

const pages = [
  {
    dir: 'dist/tools/medicare-effective-date-calculator',
    name: 'medicare-effective-date-calculator',
    quickAnswer: 'Part B starts the first day of your 65th-birthday month if you sign up in the 3 months before it. If you sign up in your birthday month or the 3 months after, it starts the first day of the next month. Premium-free Part A starts the month you turn 65 (the month before if you were born on the 1st) and can backdate up to 6 months, never before the month you turned 65.',
    positives: ['Feb 1, 2026', 'Oct 1, 2025', '$202.90', '$283', '20 or more employees', 'December 7']
  },
  {
    dir: 'dist/tools/ira-withdrawal-tax-calculator',
    name: 'ira-withdrawal-tax-calculator',
    quickAnswer: 'A traditional IRA withdrawal is taxed as ordinary income (10%–37%); there is no flat rate. In 2026 a single filer 65+ with no other income can take up to about $24,150 with no federal income tax ($18,150 standard deduction plus the $6,000 senior deduction, if MAGI is $75,000 or less); a married couple both 65+ about $47,500. Before 59½ an extra 10% applies unless an exception fits.',
    positives: ['$24,150', '$47,500', '$111,000', '$2,134', '$1,414', '$3,300', '$2,254', '$2,974', '$12,719', '$11,729', '$9,979', 'December 31']
  },
  {
    dir: 'dist/tools/local-senior-transportation-finder',
    name: 'local-senior-transportation-finder',
    quickAnswer: "Most seniors can find free or low-cost rides through four routes: Medicaid medical transportation (if enrolled), ADA paratransit (if a disability prevents using fixed-route buses), a Medicare Advantage plan's optional transportation benefit (check your plan documents), and your local Area Agency on Aging (find it at eldercare.acl.gov or 1-800-677-1116).",
    positives: ['1-800-677-1116', 'two to three business days']
  },
  {
    dir: 'dist/tools/social-security-tax-calculator',
    name: 'social-security-tax-calculator',
    quickAnswer: 'Up to 85% of Social Security can be taxable. Provisional income = other income + tax-exempt interest + 50% of your benefits. In 2026, benefits are untaxed below $25,000 (single) or $32,000 (joint), up to 50% taxable to $34,000 / $44,000, and up to 85% above that. 85% taxable is not an 85% tax rate. These thresholds are not inflation-indexed.',
    positives: ['$111,000', '42 states', '8 states', '$5,110', '$1,810', '$540', '3.6%', '$192,300', 'Box 5', 'lived apart']
  },
  {
    dir: 'dist/tools/retirement-tax-withholding-calculator',
    name: 'retirement-tax-withholding-calculator',
    quickAnswer: 'Aim to have withheld at least the smaller of 90% of your 2026 tax or 100% of your 2025 tax (110% if your 2025 AGI was over $150,000). Social Security uses Form W-4V (7%, 10%, 12% or 22%), pensions use W-4P, and IRA withdrawals use W-4R (default 10%). You owe no underpayment penalty if you owe under $1,000 at filing.',
    positives: ['$2,366', '$1,646', '$2,116', '$74,550', '$148,300', 'W-4V']
  },
  {
    dir: 'dist/tools/retirement-tax-calculator-by-state',
    name: 'retirement-tax-calculator-by-state',
    quickAnswer: 'Federally, up to 85% of Social Security can be taxed, and IRA, 401(k) and pension withdrawals are ordinary income. For 2026, only 8 states tax Social Security at all (CO, CT, MN, MT, NM, RI, UT, VT), most with income-based exemptions; 42 states plus DC do not. Nine states have no income tax.',
    positives: ['$2,050', '$1,650', '$475', '$10,464', '$9,339', '$1,780', '$111,000', '8 states']
  }
];

const forbiddenStrings = [
  'name="keywords"',
  'Verified Against Official Government Sources',
  'View all 80 tools',
  'All 78 Free Tools',
  '2026 COLA Update',
  'opens October 15',
  '$108,000',
  '$105,000',
  '$257',
  '41 states',
  '$51,525',
  '$11,450',
  '$20,800',
  '$2,250',
  '$2,000 single',
  '$1,600',
  'month four',
  'one in 30',
  'now recommends',
  'or during the month itself',
  'Robert used this calculator',
  'Margaret used our RMD Calculator',
  '407.22',
  'GN 00302',
  '00805.275',
  'round down',
  '406.21'
];

function readPageHtml(dir) {
  const indexPath = path.join(dir, 'index.html');
  if (fs.existsSync(indexPath)) {
    return fs.readFileSync(indexPath, 'utf8');
  }
  const altPath = dir + '.html';
  if (fs.existsSync(altPath)) {
    return fs.readFileSync(altPath, 'utf8');
  }
  throw new Error(`Cannot find HTML for ${dir}`);
}

async function run() {
  const htmls = {};
  for (const page of pages) {
    htmls[page.name] = readPageHtml(page.dir);
  }

  console.log('=============================================================================');
  console.log('UPGRADED PRE-PUBLISH CHECK: LOCAL BUILD VERIFICATION (dist/)');
  console.log('=============================================================================\n');

  console.log('### PART 1: FORBIDDEN STRINGS SCAN (MUST BE 0 ACROSS ALL PAGES)\n');
  console.log('| Forbidden String | ' + pages.map(p => p.name).join(' | ') + ' | Target | Status |');
  console.log('| :--- | ' + Array(pages.length + 2).fill(':---:').join(' | ') + ' |');

  for (const f of forbiddenStrings) {
    const row = [ `\`${f}\`` ];
    let allZero = true;
    for (const page of pages) {
      const html = htmls[page.name];
      let count = 0, pos = 0;
      while ((pos = html.indexOf(f, pos)) !== -1) {
        count++;
        pos += f.length;
      }
      row.push(count.toString());
      if (count > 0) allZero = false;
    }
    row.push('0');
    row.push(allZero ? 'PASS' : 'FAIL');
    console.log('| ' + row.join(' | ') + ' |');
  }

  // Kansas check
  {
    const row = [ '`Kansas` (banned on SS & State)' ];
    let pass = true;
    for (const page of pages) {
      if (page.name === 'social-security-tax-calculator' || page.name === 'retirement-tax-calculator-by-state') {
        const html = htmls[page.name];
        let count = 0, pos = 0;
        while ((pos = html.indexOf('Kansas', pos)) !== -1) {
          count++;
          pos += 6;
        }
        row.push(count.toString());
        if (count > 0) pass = false;
      } else {
        row.push('N/A (exempt)');
      }
    }
    row.push('0');
    row.push(pass ? 'PASS' : 'FAIL');
    console.log('| ' + row.join(' | ') + ' |');
  }

  console.log('\n### PART 2: REQUIRED BASE STRINGS & EXACT QUICK ANSWER MATCH\n');
  console.log('| Required Check | ' + pages.map(p => p.name).join(' | ') + ' | Target | Status |');
  console.log('| :--- | ' + Array(pages.length + 2).fill(':---:').join(' | ') + ' |');

  const baseChecks = [
    { label: '`Sources & method`', test: (html) => (html.includes('Sources & method') || html.includes('Sources &amp; method')) ? 1 : 0 },
    { label: '`Updated Oct 2026`', test: (html) => html.includes('Updated Oct 2026') ? 1 : 0 },
    { label: '`id="method-and-sources"`', test: (html) => html.includes('id="method-and-sources"') ? 1 : 0 },
    {
      label: 'Exact Quick Answer Match',
      test: (html, page) => {
        const normH = html.replace(/\s+/g, ' ');
        const normQ = page.quickAnswer.replace(/\s+/g, ' ');
        return normH.includes(normQ) ? 1 : 0;
      }
    }
  ];

  for (const bc of baseChecks) {
    const row = [ bc.label ];
    let allPass = true;
    for (const page of pages) {
      const html = htmls[page.name];
      const count = bc.test(html, page);
      row.push(count >= 1 ? `>= 1 (${count})` : '0');
      if (count < 1) allPass = false;
    }
    row.push('>= 1');
    row.push(allPass ? 'PASS' : 'FAIL');
    console.log('| ' + row.join(' | ') + ' |');
  }

  console.log('\n### PART 3: UPGRADED PAGE-SPECIFIC POSITIVE STRING CHECKS\n');
  console.log('| Page | Target Positive String | Found Count in `dist/` | Target | Status |');
  console.log('| :--- | :--- | :---: | :---: | :---: |');

  for (const page of pages) {
    const html = htmls[page.name];
    for (const str of page.positives) {
      let count = 0, pos = 0;
      while ((pos = html.indexOf(str, pos)) !== -1) {
        count++;
        pos += str.length;
      }
      const status = count >= 1 ? 'PASS' : 'FAIL';
      console.log(`| \`${page.name}\` | \`${str}\` | **${count}** | >= 1 | ${status} |`);
    }
  }
}

run().catch(err => console.error(err));

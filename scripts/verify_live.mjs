import https from 'node:https';

const pages = [
  {
    path: '/tools/medicare-effective-date-calculator/',
    name: 'Medicare Effective Date Calculator',
    quickAnswer: 'Medicare Part A and Part B coverage begins on the first day of your 65th birthday month if you enroll during the three months before that month or during the month itself. If you were born on the first day of any month, your coverage begins on the first day of the preceding month. Enrolling in the three months after your birth month delays Part B until the first of the month following enrollment.'
  },
  {
    path: '/tools/ira-withdrawal-tax-calculator/',
    name: 'IRA Withdrawal Tax Calculator',
    quickAnswer: 'Traditional IRA withdrawals are taxed as ordinary income at your regular federal income tax rate (10% to 37%), not at capital gains rates. If you are under age 59½, you also owe a 10% early withdrawal penalty unless an exception applies. Withdrawals increase your provisional income, which can trigger taxes on up to 85% of your Social Security benefits.'
  },
  {
    path: '/tools/local-senior-transportation-finder/',
    name: 'Local Senior Transportation Finder',
    quickAnswer: "Most seniors can find free or low-cost rides through four routes: Medicaid medical transportation (if enrolled), ADA paratransit (if a disability prevents using fixed-route buses), a Medicare Advantage plan's optional transportation benefit (check your plan documents), and your local Area Agency on Aging (find it at eldercare.acl.gov or 1-800-677-1116)."
  },
  {
    path: '/tools/social-security-tax-calculator/',
    name: 'Social Security Tax Calculator',
    quickAnswer: 'Up to 85% of Social Security can be taxable. Provisional income = other income + tax-exempt interest + 50% of your benefits. In 2026, benefits are untaxed below $25,000 (single) or $32,000 (joint), up to 50% taxable to $34,000 / $44,000, and up to 85% above that. 85% taxable is not an 85% tax rate. These thresholds are not inflation-indexed.'
  },
  {
    path: '/tools/retirement-tax-withholding-calculator/',
    name: 'Retirement Tax Withholding Calculator',
    quickAnswer: 'Aim to have withheld at least the smaller of 90% of your 2026 tax or 100% of your 2025 tax (110% if your 2025 AGI was over $150,000). Social Security uses Form W-4V (7%, 10%, 12% or 22%), pensions use W-4P, and IRA withdrawals use W-4R (default 10%). You owe no underpayment penalty if you owe under $1,000 at filing.'
  },
  {
    path: '/tools/retirement-tax-calculator-by-state/',
    name: 'Retirement Tax Calculator by State',
    quickAnswer: 'Federally, up to 85% of Social Security can be taxed, and IRA, 401(k) and pension withdrawals are ordinary income. For 2026, only 8 states tax Social Security at all (CO, CT, MN, MT, NM, RI, UT, VT), most with income-based exemptions; 42 states plus DC do not. Nine states have no income tax.'
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
  '41 states',
  'Kansas', // only on SS tax and state pages
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

async function fetchPage(url) {
  const cacheBuster = `?_cb=${Date.now()}`;
  const fullUrl = `${url}${cacheBuster}`;
  const res = await fetch(fullUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SeniorsAudit-Verifier/1.0',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return await res.text();
}

async function verifyAll() {
  const baseUrl = process.env.BASE_URL || 'https://www.seniorsaudit.com';
  console.log(`\n======================================================`);
  console.log(`VERIFYING LIVE PRODUCTION URLS AT: ${baseUrl}`);
  console.log(`======================================================\n`);

  const report = [];

  for (const page of pages) {
    const pageUrl = `${baseUrl}${page.path}`;
    try {
      const html = await fetchPage(pageUrl);

      // Check required
      const hasSourcesMethod = html.includes('Sources & method') || html.includes('Sources &amp; method');
      const hasUpdatedOct = html.includes('Updated Oct 2026');
      const hasMethodId = html.includes('id="method-and-sources"');
      // normalize whitespace for quick answer check
      const normHtml = html.replace(/\s+/g, ' ');
      const normQA = page.quickAnswer.replace(/\s+/g, ' ');
      const hasQuickAnswer = normHtml.includes(normQA);

      // Check forbidden
      const forbiddenHits = {};
      let totalHits = 0;
      for (const f of forbiddenStrings) {
        if (f === 'Kansas' && !page.path.includes('social-security-tax-calculator') && !page.path.includes('retirement-tax-calculator-by-state')) {
          continue;
        }
        let count = 0;
        let pos = 0;
        while ((pos = html.indexOf(f, pos)) !== -1) {
          count++;
          pos += f.length;
        }
        forbiddenHits[f] = count;
        totalHits += count;
      }

      report.push({
        path: page.path,
        hasSourcesMethod,
        hasUpdatedOct,
        hasMethodId,
        hasQuickAnswer,
        totalForbiddenHits: totalHits,
        forbiddenHits
      });

      console.log(`PAGE: ${page.path}`);
      console.log(`  Sources & method: ${hasSourcesMethod ? 'YES' : 'NO'}`);
      console.log(`  Updated Oct 2026: ${hasUpdatedOct ? 'YES' : 'NO'}`);
      console.log(`  id="method-and-sources": ${hasMethodId ? 'YES' : 'NO'}`);
      console.log(`  Exact Quick Answer: ${hasQuickAnswer ? 'YES' : 'NO'}`);
      console.log(`  Total Forbidden Hits: ${totalHits}`);
      if (totalHits > 0) {
        for (const [k, v] of Object.entries(forbiddenHits)) {
          if (v > 0) console.log(`    HIT: "${k}" = ${v}`);
        }
      }
      console.log('------------------------------------------------------');
    } catch (err) {
      console.error(`ERROR fetching ${pageUrl}:`, err.message);
    }
  }

  return report;
}

verifyAll();

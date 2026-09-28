import fs from 'fs';
import path from 'path';

// Read sitemap
const sitemapRaw = fs.readFileSync('dist/sitemap.xml', 'utf8');
const sitemapUrls = new Set();
const matches = sitemapRaw.match(/<loc>([^<]+)<\/loc>/g) || [];
for (const m of matches) {
  const url = m.replace(/<\/?loc>/g, '');
  sitemapUrls.add(new URL(url).pathname);
}

// All proposed links in the new structure:
const proposedLinks = [
  // Top level & hubs
  '/tools/',
  '/social-security/',
  '/medicare/',
  '/medicaid/',
  '/irs/',
  '/retirement/',
  '/taxes/',
  '/blog/',
  '/resources/',
  '/educational-videos/',
  '/search/',
  '/contact/',

  // Tools & Calculators anchors (base is /tools/)
  // 6 Most used tools:
  '/tools/social-security-full-retirement-age-calculator/',
  '/tools/medicare-premium-calculator/',
  '/tools/medicare-irmaa-calculator/',
  '/tools/rmd-calculator/',
  '/tools/scam-message-call-decoder/',
  '/tools/universal-senior-benefits-screener/',

  // Social Security dropdown:
  '/social-security/full-retirement-age-guide/',
  '/social-security/how-much-social-security-will-i-get/',
  '/social-security/social-security-cola-2026/',
  '/tools/social-security-benefits-calculator/',
  '/tools/social-security-break-even-calculator/',

  // Medicare & Medicaid dropdown:
  '/medicare/basics/',
  '/medicare/enrollment/',
  '/medicare/plan-comparison/',
  '/medicare/medicare-advantage/',
  '/medicare/part-d/',
  '/medicare/costs/',
  '/medicare/at-65/',
  '/medicare/problems/',
  '/medicaid/who-qualifies-for-medicaid/',
  '/medicaid/medicaid-savings-programs/',
  '/medicaid/medicaid-cuts-2026/',

  // IRS Notices dropdown:
  '/irs/what-is-a-cp2000-notice/',
  '/tools/cp14-notice/',
  '/tools/cp504-notice/',
  '/tools/irs-lt11-notice-decoder/',
  '/tools/irs-cp90-notice-decoder/',
  '/tools/cp2000-response-letter-sample/',

  // Retirement & Taxes dropdown:
  '/retirement/rmd-mandatory-withdrawing/',
  '/taxes/retirement-tax-withholding/',
  '/tools/roth-conversion-calculator/'
];

const results = [];
for (const href of proposedLinks) {
  const inSitemap = sitemapUrls.has(href) || sitemapUrls.has(href.replace(/\/$/, ''));
  const filePath = href === '/' ? 'dist/index.html' : path.join('dist', href.replace(/^\//, ''), 'index.html');
  const exists = fs.existsSync(filePath);
  results.push({
    href,
    status: exists ? 200 : 404,
    inSitemap
  });
}

console.log('Total proposed links checked:', results.length);
const failed = results.filter(r => r.status !== 200);
console.log('Any failed 404 links?', failed.length === 0 ? 'NONE! ALL 200 OK' : failed);
const notInSitemap = results.filter(r => !r.inSitemap);
console.log('Links not in sitemap:', notInSitemap.map(r => r.href));

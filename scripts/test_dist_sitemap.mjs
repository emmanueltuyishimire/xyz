import fs from 'fs';
import path from 'path';

console.log('--- CI Post-Build dist/sitemap.xml Verification Test ---');

const distSitemapPath = path.resolve('dist/sitemap.xml');
if (!fs.existsSync(distSitemapPath)) {
  console.error('FAIL: dist/sitemap.xml does not exist! Run npm run build first.');
  process.exit(1);
}

const sitemapContent = fs.readFileSync(distSitemapPath, 'utf8');
let errors = 0;

// 1. Read netlify.toml to get all redirected tool slugs
const netlifyPath = path.resolve('netlify.toml');
const netlifyContent = fs.readFileSync(netlifyPath, 'utf8');
const redirectRegex = /from\s*=\s*['"]\/tools\/([^/'"*]+)\/?['"]/g;
const redirectedSlugs = new Set();
let rm;
while ((rm = redirectRegex.exec(netlifyContent)) !== null) {
  redirectedSlugs.add(rm[1]);
}

// 2. Derive valid canonical tools: src/pages/tools/*.astro minus index.astro minus redirected tools
const toolsDir = path.resolve('src/pages/tools');
const canonicalTools = fs.readdirSync(toolsDir)
  .filter(f => f.endsWith('.astro') && f !== 'index.astro')
  .map(f => f.replace('.astro', ''))
  .filter(slug => !redirectedSlugs.has(slug));

for (const slug of canonicalTools) {
  const expectedUrl = `https://www.seniorsaudit.com/tools/${slug}/`;
  if (!sitemapContent.includes(expectedUrl)) {
    console.error(`FAIL: Missing canonical tool in dist/sitemap.xml: ${expectedUrl}`);
    errors++;
  }
}

// 2. Check no redirected URLs exist
const redirectedUrls = [
  'https://www.seniorsaudit.com/tools/medicare-advantage-total-cost-estimator/',
  'https://www.seniorsaudit.com/tools/medicare-advantage-comparison-tool/',
  'https://www.seniorsaudit.com/tools/part-d-late-enrollment-penalty-calculator/',
  'https://www.seniorsaudit.com/tools/medicare-part-b-premium-calculator/',
  'https://www.seniorsaudit.com/tools/social-security-benefits-estimator/',
  'https://www.seniorsaudit.com/tools/social-security-cola-estimator/',
  'https://www.seniorsaudit.com/tools/rmd-calculator-by-age/',
  'https://www.seniorsaudit.com/tools/retirement-tax-estimator/',
  'https://www.seniorsaudit.com/about/simon-james/'
];

for (const redir of redirectedUrls) {
  if (sitemapContent.includes(redir)) {
    console.error(`FAIL: Redirected URL found in dist/sitemap.xml: ${redir}`);
    errors++;
  }
}

// 3. Check no /resources/* URLs exist
if (/https:\/\/www\.seniorsaudit\.com\/resources\//.test(sitemapContent)) {
  console.error('FAIL: /resources/* path found in dist/sitemap.xml');
  errors++;
}

if (errors > 0) {
  console.error(`\nFAILED: Found ${errors} error(s) in dist/sitemap.xml verification.`);
  process.exit(1);
} else {
  console.log(`PASSED: dist/sitemap.xml is valid (${canonicalTools.length} canonical tools present, 0 redirected URLs, 0 /resources/* paths).`);
}

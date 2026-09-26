import fs from 'fs';
import path from 'path';

const sitemapXml = fs.readFileSync('C:/Users/JAMES PERFECT/.gemini/antigravity/brain/ca38152b-5ae0-492e-9e55-fef880f0d953/.system_generated/steps/3/content.md', 'utf8');

const sitemapUrls = [];
const locRegex = /<loc>(https:\/\/www\.seniorsaudit\.com([^<]*))<\/loc>/g;
let match;
while ((match = locRegex.exec(sitemapXml)) !== null) {
  let urlPath = match[2];
  if (!urlPath.endsWith('/') && !urlPath.includes('.')) {
    urlPath += '/';
  }
  if (!urlPath) urlPath = '/';
  sitemapUrls.push(urlPath);
}

console.log('Total URLs in live sitemap:', sitemapUrls.length);

function walk(dir) {
  let res = [];
  try {
    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        if (!full.includes('node_modules') && !full.includes('.git') && !full.includes('.astro') && !full.includes('dist')) {
          res = res.concat(walk(full));
        }
      } else if (/\.(astro|ts|tsx|md|mdx|html)$/.test(item)) {
        res.push(full);
      }
    }
  } catch (e) {}
  return res;
}

const allSourceFiles = walk('src');
console.log('Total source files found:', allSourceFiles.length);

// 1. Check for specific broken links & all internal hrefs
const hrefRegex = /href=["'](\/[^"'#?]*)/g;
const foundHrefs = new Map(); // href -> array of files
const confirmedMismatches = [
  '/tools/social-security-benefits-estimator/',
  '/tools/rmd-calculator-by-age/',
  '/tools/irs-cp2000-response-guide/',
  '/irs/cp2000-underreporter-notice/',
  '/about/emmanuel-t/'
];

allSourceFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = hrefRegex.exec(content)) !== null) {
    let href = m[1];
    if (!href.endsWith('/') && !path.extname(href)) {
      href += '/';
    }
    if (!foundHrefs.has(href)) {
      foundHrefs.set(href, []);
    }
    foundHrefs.get(href).push(file);
  }
});

console.log('\n--- CONFIRMED MISMATCH CHECK ---');
confirmedMismatches.forEach(badHref => {
  const normalized = badHref.replace(/\/$/, '') + '/';
  const found = foundHrefs.get(normalized) || foundHrefs.get(badHref.replace(/\/$/, '')) || [];
  console.log(`${badHref}: found in ${found.length} places`, found);
});

// Also check raw string occurrences of the bad slugs
console.log('\n--- RAW STRING SEARCH FOR BAD SLUGS ---');
const badSlugs = [
  'social-security-benefits-estimator',
  'rmd-calculator-by-age',
  'irs-cp2000-response-guide',
  'cp2000-underreporter-notice',
  'about/emmanuel-t/',
  '/about/emmanuel-t'
];

badSlugs.forEach(slug => {
  const matches = [];
  allSourceFiles.forEach(f => {
    const text = fs.readFileSync(f, 'utf8');
    if (text.includes(slug)) {
      matches.push(f);
    }
  });
  console.log(`Slug "${slug}": ${matches.length} files`, matches);
});

// 2. Cross reference all found hrefs against sitemap
const missingFromSitemap = [];
const sitemapSet = new Set(sitemapUrls);

const assetExtensions = ['.png', '.jpg', '.webp', '.svg', '.xml', '.ico', '.webmanifest', '.pdf', '.txt', '.css', '.js'];

for (const [href, files] of foundHrefs.entries()) {
  const isAsset = assetExtensions.some(ext => href.toLowerCase().endsWith(ext));
  if (isAsset) continue;
  if (href.startsWith('/api') || href.startsWith('/admin')) continue;
  
  if (!sitemapSet.has(href)) {
    missingFromSitemap.push({ href, count: files.length, files: files.slice(0, 3) });
  }
}

console.log('\n--- HREFS FOUND IN CODE BUT ABSENT FROM SITEMAP ---');
console.log(JSON.stringify(missingFromSitemap, null, 2));

// 3. Placeholders and under construction check
console.log('\n--- PLACEHOLDER / UNDER CONSTRUCTION SIGNALS ---');
const placeholderPatterns = [
  /coming\s+soon/i,
  /under\s+construction/i,
  /\bTBD\b/,
  /placeholder/i,
  /lorem\s+ipsum/i
];

const placeholderHits = [];
allSourceFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  placeholderPatterns.forEach(pattern => {
    const lines = content.split('\n');
    lines.forEach((l, idx) => {
      if (pattern.test(l)) {
        if (!l.includes('placeholder=') && !l.includes('::placeholder') && !l.includes('Search Engine Verification') && !l.includes('replace placeholders')) {
          placeholderHits.push(`${file}:${idx+1} [${pattern.source}]: ${l.trim()}`);
        }
      }
    });
  });
});
console.log(`Placeholder hits (non-input attribute): ${placeholderHits.length}`);
console.log(placeholderHits.slice(0, 30).join('\n'));

fs.writeFileSync('scripts/audit_output.json', JSON.stringify({
  sitemapUrlsCount: sitemapUrls.length,
  missingFromSitemap,
  placeholderHits
}, null, 2));

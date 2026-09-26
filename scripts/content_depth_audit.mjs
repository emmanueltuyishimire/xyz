import fs from 'fs';
import path from 'path';

// Load generated sitemap from dist/sitemap.xml
const distSitemapPath = path.resolve('dist/sitemap.xml');
if (!fs.existsSync(distSitemapPath)) {
  console.error('dist/sitemap.xml does not exist! Please build the site first.');
  process.exit(1);
}

const sitemapXml = fs.readFileSync(distSitemapPath, 'utf8');
const locRegex = /<loc>(https:\/\/www\.seniorsaudit\.com([^<]*))<\/loc>/g;
const urls = [];
let match;
while ((match = locRegex.exec(sitemapXml)) !== null) {
  let urlPath = match[2];
  if (!urlPath.endsWith('/') && !path.extname(urlPath)) {
    urlPath += '/';
  }
  if (!urlPath) urlPath = '/';
  urls.push(urlPath);
}

console.log(`Total URLs in sitemap: ${urls.length}\n`);

const results = [];
let under500Count = 0;
let missingGovLinks = 0;
let authorInconsistencies = 0;
let placeholderHits = 0;

for (const url of urls) {
  let htmlFilePath;
  if (url === '/') {
    htmlFilePath = path.resolve('dist/index.html');
  } else {
    const clean = url.replace(/^\//, '').replace(/\/$/, '');
    htmlFilePath = path.resolve('dist', clean, 'index.html');
  }

  if (!fs.existsSync(htmlFilePath)) {
    results.push({
      url,
      exists: false,
      error: `Missing HTML file at ${htmlFilePath}`
    });
    continue;
  }

  const html = fs.readFileSync(htmlFilePath, 'utf8');

  // Title & description
  const titleMatch = /<title>([^<]*)<\/title>/i.exec(html);
  const title = titleMatch ? titleMatch[1] : '';

  const descMatch = /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i.exec(html) ||
                    /<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i.exec(html);
  const desc = descMatch ? descMatch[1] : '';

  // Extract main/article content for word count
  let mainContent = '';
  const mainMatch = /<main[\s\S]*?<\/main>/i.exec(html);
  const articleMatch = /<article[\s\S]*?<\/article>/i.exec(html);

  if (articleMatch) {
    mainContent = articleMatch[0];
  } else if (mainMatch) {
    mainContent = mainMatch[0];
  } else {
    const bodyMatch = /<body[\s\S]*?<\/body>/i.exec(html);
    mainContent = bodyMatch ? bodyMatch[0] : html;
  }

  // Strip script, style, svg, nav, footer, header from word count
  let textOnly = mainContent
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<aside[\s\S]*?<\/aside>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = textOnly ? textOnly.split(/\s+/).filter(w => w.length > 0) : [];
  const wordCount = words.length;

  // .gov citations
  const govLinks = [];
  const govRegex = /href=["'](https?:\/\/[^"']*\.gov[^"']*)["']/gi;
  let gMatch;
  while ((gMatch = govRegex.exec(html)) !== null) {
    govLinks.push(gMatch[1]);
  }
  const uniqueGovLinks = [...new Set(govLinks)];

  // FAQ check
  const hasFaqSchema = /"FAQPage"/i.test(html);
  const hasFaqHeading = /<h[23][^>]*>[^<]*(FAQ|Frequently Asked Questions|Common Questions)[^<]*<\/h[23]>/i.test(html);
  const hasFaq = hasFaqSchema || hasFaqHeading;

  // Last reviewed date
  const hasLastReviewed = /last\s+(reviewed|updated)/i.test(html) || /dateModified/i.test(html);

  // Author check
  const hasCanonicalAuthor = /Emmanuel Tuyishimire/i.test(html);
  const badAuthorVariants = [];
  if (/T\.\s*Emmanuel/i.test(html)) badAuthorVariants.push('T. Emmanuel');
  if (/Emmanuel\s+TUYISHIMIRE/.test(html)) badAuthorVariants.push('Emmanuel TUYISHIMIRE');
  if (/TUYISHIMIRE\s+Emmanuel/.test(html)) badAuthorVariants.push('TUYISHIMIRE Emmanuel');

  if (badAuthorVariants.length > 0) {
    authorInconsistencies++;
  }

  // Placeholder check
  const placeholderPatterns = [
    /coming\s+soon/i,
    /under\s+construction/i,
    /lorem\s+ipsum/i,
    /placeholder\s+text/i,
    /page\s+under\s+development/i
  ];
  const foundPlaceholders = [];
  // Strip out HTML comments and input attributes (like placeholder="Search...")
  const visibleHtml = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/placeholder=["'][^"']*["']/g, '');

  for (const pat of placeholderPatterns) {
    if (pat.test(visibleHtml)) {
      foundPlaceholders.push(pat.toString());
    }
  }

  if (foundPlaceholders.length > 0) {
    placeholderHits++;
  }

  // Categorize page type
  let pageType = 'page';
  if (url === '/') pageType = 'home';
  else if (url.startsWith('/tools/')) pageType = 'tool';
  else if (url.startsWith('/resources/')) pageType = 'product';
  else if (url.startsWith('/educational-videos/')) pageType = 'video';
  else if (['/medicare/', '/social-security/', '/medicaid/', '/irs/', '/retirement/', '/taxes/', '/blog/'].includes(url)) pageType = 'hub';
  else if (['/about/', '/contact/', '/privacy-policy/', '/disclaimer/', '/terms-of-use/', '/about/emmanuel-tuyishimire/'].includes(url)) pageType = 'utility';
  else pageType = 'article';

  if (wordCount < 500 && pageType === 'article') {
    under500Count++;
  }

  results.push({
    url,
    exists: true,
    pageType,
    title,
    wordCount,
    uniqueGovCount: uniqueGovLinks.length,
    hasFaq,
    hasLastReviewed,
    hasCanonicalAuthor,
    badAuthorVariants,
    foundPlaceholders
  });
}

// Summary Report
console.log('='.repeat(80));
console.log('SENIORS AUDIT - COMPREHENSIVE CONTENT DEPTH & COMPLIANCE REPORT');
console.log('='.repeat(80));
console.log(`Total URLs analyzed: ${results.length}`);
console.log(`Articles with < 500 words: ${under500Count}`);
console.log(`Author name inconsistencies: ${authorInconsistencies}`);
console.log(`User-facing placeholder occurrences: ${placeholderHits}`);
console.log('-'.repeat(80));

// Detail any pages with issues
console.log('\n--- PAGES UNDER 500 WORDS ---');
const under500 = results.filter(r => r.wordCount < 500);
if (under500.length === 0) {
  console.log('None! All pages exceed 500 words.');
} else {
  under500.forEach(r => {
    console.log(`[${r.pageType.toUpperCase()}] ${r.url}: ${r.wordCount} words | Title: "${r.title}"`);
  });
}

console.log('\n--- PAGES WITH AUTHOR INCONSISTENCIES ---');
const authorIssues = results.filter(r => r.badAuthorVariants && r.badAuthorVariants.length > 0);
if (authorIssues.length === 0) {
  console.log('None! Author name is 100% standardized across all pages.');
} else {
  authorIssues.forEach(r => {
    console.log(`${r.url}: Found bad variants: ${r.badAuthorVariants.join(', ')}`);
  });
}

console.log('\n--- PAGES WITH USER-FACING PLACEHOLDERS ---');
const placeholderIssues = results.filter(r => r.foundPlaceholders && r.foundPlaceholders.length > 0);
if (placeholderIssues.length === 0) {
  console.log('None! Zero coming soon / under construction placeholders.');
} else {
  placeholderIssues.forEach(r => {
    console.log(`${r.url}: Found placeholders: ${r.foundPlaceholders.join(', ')}`);
  });
}

console.log('\n--- WORD COUNT BREAKDOWN BY CATEGORY ---');
const categories = {};
for (const r of results) {
  if (!categories[r.pageType]) categories[r.pageType] = { count: 0, totalWords: 0, minWords: Infinity, maxWords: 0 };
  categories[r.pageType].count++;
  categories[r.pageType].totalWords += r.wordCount;
  if (r.wordCount < categories[r.pageType].minWords) categories[r.pageType].minWords = r.wordCount;
  if (r.wordCount > categories[r.pageType].maxWords) categories[r.pageType].maxWords = r.wordCount;
}

for (const [type, data] of Object.entries(categories)) {
  const avg = Math.round(data.totalWords / data.count);
  console.log(`Type: ${type.padEnd(10)} | Pages: ${String(data.count).padEnd(4)} | Avg Words: ${String(avg).padEnd(6)} | Min: ${String(data.minWords).padEnd(6)} | Max: ${data.maxWords}`);
}

// Save detailed JSON
fs.writeFileSync('scripts/audit_results.json', JSON.stringify(results, null, 2));
console.log('\nDetailed results saved to scripts/audit_results.json');

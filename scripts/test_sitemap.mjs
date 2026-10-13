import fs from 'fs';
import path from 'path';

console.log('--- CI Sitemap & Tool Integrity Test ---');

// 1. Read sitemap.xml.ts
const sitemapPath = path.resolve('src/pages/sitemap.xml.ts');
const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

// 2. Read netlify.toml redirects
const netlifyPath = path.resolve('netlify.toml');
const netlifyContent = fs.readFileSync(netlifyPath, 'utf8');
const redirectRegex = /from\s*=\s*['"]([^'"]+)['"]/g;
const redirectedPaths = new Set();
let rm;
while ((rm = redirectRegex.exec(netlifyContent)) !== null) {
  redirectedPaths.add(rm[1]);
}

// 3. Collect all tools from src/pages/tools/*.astro
const toolsDir = path.resolve('src/pages/tools');
const toolFiles = fs.readdirSync(toolsDir)
  .filter(f => f.endsWith('.astro') && f !== 'index.astro')
  .map(f => f.replace('.astro', ''));

let errors = [];

// Check A: Every tool in src/pages/tools/*.astro must be in sitemap.xml.ts
for (const tool of toolFiles) {
  if (!sitemapContent.includes(`'/tools/${tool}/'`) && !sitemapContent.includes(`"/tools/${tool}/"`)) {
    errors.push(`Tool missing from sitemap: /tools/${tool}/`);
  }
}

// Check B: No redirected URL must appear in sitemap.xml.ts
for (const redir of redirectedPaths) {
  if (sitemapContent.includes(`'${redir}'`) || sitemapContent.includes(`"${redir}"`)) {
    errors.push(`Redirected URL found in sitemap: ${redir}`);
  }
}

// Check C: No /resources/* URL must appear in sitemap.xml.ts
if (sitemapContent.includes('/resources/')) {
  errors.push(`Found /resources/ reference in sitemap.xml.ts`);
}

// Check D: public/sitemap.xml must NOT exist
if (fs.existsSync('public/sitemap.xml')) {
  errors.push(`public/sitemap.xml exists! Static override shadow file should remain deleted.`);
}

if (errors.length > 0) {
  console.error(`FAILED: ${errors.length} issue(s) detected:`);
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log(`PASSED: All ${toolFiles.length} tool pages are canonical in sitemap.`);
  console.log('PASSED: No 301-redirected URLs exist in sitemap.');
  console.log('PASSED: No /resources/* paths exist in sitemap.');
  console.log('PASSED: No public/sitemap.xml shadow file.');
}

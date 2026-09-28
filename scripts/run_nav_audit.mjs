import fs from 'fs';
import path from 'path';

// 1. Read sitemap
const sitemapRaw = fs.readFileSync('dist/sitemap.xml', 'utf8');
const sitemapUrls = [];
const sitemapMatches = sitemapRaw.match(/<loc>([^<]+)<\/loc>/g) || [];
for (const m of sitemapMatches) {
  const url = m.replace(/<\/?loc>/g, '');
  const urlPath = new URL(url).pathname;
  sitemapUrls.push(urlPath);
}

console.log('Total URLs in sitemap:', sitemapUrls.length);

// 2. Current links in Header.astro
// navItems:
//   { label: 'Tools & Calculators', href: '/tools/', hasDropdown: true, dropdownKey: 'tools' },
//   { label: 'Social Security', href: '/social-security/' },
//   { label: 'Medicare', href: '/medicare/' },
//   { label: 'IRS Notices', href: '/irs/' },
//   { label: 'Retirement', href: '/retirement/' },
//   { label: 'Resources', href: '/resources/' },
//   { label: 'Learning Center', href: '/blog/' },
// toolItems:
//   { label: 'Full Retirement Age Calculator', href: '/tools/social-security-full-retirement-age-calculator/', section: 'Social Security' },
//   { label: 'Benefits Estimator', href: '/tools/social-security-benefits-calculator/', section: 'Social Security' },
//   { label: 'IRMAA Calculator', href: '/tools/medicare-irmaa-calculator/', section: 'Medicare' },
//   { label: 'Late Enrollment Penalty', href: '/tools/medicare-late-enrollment-penalty-calculator/', section: 'Medicare' },
//   { label: 'RMD Calculator by Age', href: '/tools/rmd-calculator/', section: 'Retirement' },
//   { label: 'CP2000 Response Letter Tool', href: '/tools/cp2000-response-letter-sample/', section: 'IRS' },
// Header actions:
//   Logo: '/'
//   Search: '/search/'
//   Help: '/contact/'
// Mobile menu also has:
//   Search: '/search/'
//   Contact & Help: '/contact/'

const currentHeaderLinks = [
  { label: 'Logo', href: '/' },
  { label: 'Tools & Calculators', href: '/tools/' },
  { label: 'Social Security', href: '/social-security/' },
  { label: 'Medicare', href: '/medicare/' },
  { label: 'IRS Notices', href: '/irs/' },
  { label: 'Retirement', href: '/retirement/' },
  { label: 'Resources', href: '/resources/' },
  { label: 'Learning Center', href: '/blog/' },
  { label: 'Full Retirement Age Calculator', href: '/tools/social-security-full-retirement-age-calculator/' },
  { label: 'Benefits Estimator', href: '/tools/social-security-benefits-calculator/' },
  { label: 'IRMAA Calculator', href: '/tools/medicare-irmaa-calculator/' },
  { label: 'Late Enrollment Penalty', href: '/tools/medicare-late-enrollment-penalty-calculator/' },
  { label: 'RMD Calculator by Age', href: '/tools/rmd-calculator/' },
  { label: 'CP2000 Response Letter Tool', href: '/tools/cp2000-response-letter-sample/' },
  { label: 'View all calculators →', href: '/tools/' },
  { label: 'Search', href: '/search/' },
  { label: 'Help', href: '/contact/' },
];

const currentMobileLinks = [
  { label: 'Tools & Calculators', href: '/tools/' },
  { label: 'Social Security', href: '/social-security/' },
  { label: 'Medicare', href: '/medicare/' },
  { label: 'IRS Notices', href: '/irs/' },
  { label: 'Retirement', href: '/retirement/' },
  { label: 'Resources', href: '/resources/' },
  { label: 'Learning Center', href: '/blog/' },
  { label: 'Search Guides & Tools', href: '/search/' },
  { label: 'Contact & Help', href: '/contact/' },
];

// Check status of each link
function checkUrl(urlPath) {
  // Normalize
  const p = urlPath.endsWith('/') ? urlPath : urlPath + '/';
  const inSitemap = sitemapUrls.includes(p) || sitemapUrls.includes(urlPath);
  
  // Check if file exists in dist
  let filePath = path.join('dist', urlPath.replace(/^\//, ''), 'index.html');
  if (urlPath === '/') filePath = path.join('dist', 'index.html');
  const fileExists = fs.existsSync(filePath);

  // Read H1 if exists
  let h1 = '';
  if (fileExists) {
    const html = fs.readFileSync(filePath, 'utf8');
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) {
      h1 = h1Match[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
    }
  }

  return {
    href: urlPath,
    inSitemap,
    status: fileExists ? 200 : 404,
    h1
  };
}

const checkedHeader = currentHeaderLinks.map(l => ({ ...l, ...checkUrl(l.href) }));
const checkedMobile = currentMobileLinks.map(l => ({ ...l, ...checkUrl(l.href) }));

console.log('Checked header links count:', checkedHeader.length);
console.log('Any 404s in header?', checkedHeader.filter(l => l.status !== 200));

// Check /search/ specifically
const searchCheck = checkUrl('/search/');
console.log('/search/ details:', searchCheck);

// Label comparisons
// Read footer links from Footer.astro
const footerContent = fs.readFileSync('src/components/layout/Footer.astro', 'utf8');
const footerLinkMatches = [...footerContent.matchAll(/\{\s*label:\s*['"]([^'"]+)['"],\s*href:\s*['"]([^'"]+)['"]\s*\}/g)];
const footerLinks = footerLinkMatches.map(m => ({ label: m[1], href: m[2] }));

// Tools page cards labels
const toolsContent = fs.readFileSync('src/pages/tools/index.astro', 'utf8');
// match tools in tools/index.astro
const toolsPageMatches = [...toolsContent.matchAll(/title:\s*['"]([^'"]+)['"][\s\S]*?href:\s*['"]([^'"]+)['"]/g)];
const toolsLabels = {};
for (const m of toolsPageMatches) {
  toolsLabels[m[2]] = m[1];
}

const auditReport = {
  sitemapCount: sitemapUrls.length,
  search: searchCheck,
  headerLinks: checkedHeader,
  mobileLinks: checkedMobile,
  footerLinks,
  toolsLabels
};

fs.writeFileSync('scripts/nav_audit_report.json', JSON.stringify(auditReport, null, 2));
console.log('Report saved to scripts/nav_audit_report.json');

import { getCollection } from 'astro:content';

export const prerender = false;

export async function GET() {
  const now = new Date();
  
  // Fetch all collections filtering out future articles dynamically at request time
  const medicare = await getCollection('medicare', ({ data }) => data.draft !== true && new Date(data.publishDate) <= now);
  const medicaid = await getCollection('medicaid', ({ data }) => data.draft !== true && new Date(data.publishDate) <= now);
  const blog = await getCollection('blog', ({ data }) => data.draft !== true && new Date(data.publishDate) <= now);
  const irs = await getCollection('irs', ({ data }) => data.draft !== true && new Date(data.publishDate) <= now);
  const retirement = await getCollection('retirement', ({ data }) => data.draft !== true && new Date(data.publishDate) <= now);
  const socialSecurity = await getCollection('social-security', ({ data }) => data.draft !== true && new Date(data.publishDate) <= now);
  const taxes = await getCollection('taxes', ({ data }) => data.draft !== true && new Date(data.publishDate) <= now);

  const siteUrl = 'https://www.seniorsaudit.com';

  // Core static pages
  const staticPages = [
    '',
    '/about/',
    '/contact/',
    '/privacy-policy/',
    '/disclaimer/',
    '/terms-of-use/',
    '/tools/',
    '/tools/medicare-irmaa-calculator/',
    '/tools/medicare-late-enrollment-penalty-calculator/',
    '/tools/medicare-savings-estimator/',
    '/tools/medicare-enrollment-deadline-calculator/',
    '/tools/retirement-tax-withholding-calculator/',
    '/tools/rmd-calculator/',
    '/tools/social-security-benefits-estimator/',
    '/tools/social-security-break-even-calculator/',
    '/tools/social-security-full-retirement-age-calculator/',
    '/tools/ssa-earnings-test-calculator/',
    '/tools/irs-cp2000-response-guide/',
    '/medicare/',
    '/medicare/basics/',
    '/medicare/enrollment/',
    '/medicare/plan-comparison/',
    '/medicare/medicare-advantage/',
    '/medicare/costs-and-penalties/',
    '/medicare/part-d/',
    '/medicaid/',
    '/blog/',
    '/irs/',
    '/retirement/',
    '/social-security/',
    '/taxes/',
  ];

  // Helper to map collection entries to sitemap url objects
  const mapEntries = (collectionName: string, entries: any[]) => 
    entries.map(entry => ({
      loc: `${siteUrl}/${collectionName}/${entry.id}/`,
      lastmod: new Date(entry.data.updatedDate || entry.data.publishDate).toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.7'
    }));

  const urls = [
    // Static pages
    ...staticPages.map(page => ({
      loc: `${siteUrl}${page}`,
      lastmod: new Date().toISOString().split('T')[0], // current date
      changefreq: 'daily',
      priority: page === '' ? '1.0' : '0.8'
    })),
    // Dynamic collections
    ...mapEntries('medicare', medicare),
    ...mapEntries('medicaid', medicaid),
    ...mapEntries('blog', blog),
    ...mapEntries('irs', irs),
    ...mapEntries('retirement', retirement),
    ...mapEntries('social-security', socialSecurity),
    ...mapEntries('taxes', taxes),
  ];

  // Generate XML
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('').trim()}
</urlset>`;

  return new Response(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=10800', // cache on CDN for 1-3 hours
    }
  });
}

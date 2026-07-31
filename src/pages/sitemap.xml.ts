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
    // Scam & Fraud Protection
    '/tools/scam-message-call-decoder/',
    '/tools/is-this-real-letter-checker/',
    '/tools/robocall-caller-id-guide/',
    '/tools/gift-card-wire-transfer-scam-checklist/',
    '/tools/romance-scam-red-flag-checklist/',
    '/tools/ai-voice-clone-grandkid-scam-verification/',
    '/tools/family-trusted-contact-setup-guide/',
    // Unclaimed Benefits & Assistance
    '/tools/universal-senior-benefits-screener/',
    '/tools/snap-eligibility-calculator-for-seniors/',
    '/tools/liheap-eligibility-checker/',
    '/tools/property-tax-relief-checker/',
    '/tools/senior-discount-finder/',
    // Medical Bills & Healthcare Costs
    '/tools/hospital-bill-line-item-checker/',
    '/tools/how-to-dispute-a-medical-bill/',
    '/tools/prescription-price-comparison-guide/',
    '/tools/medicare-advantage-vs-original-medicare-cost-checker/',
    // Caregiver & Family Support
    '/tools/do-i-need-care-options-wizard/',
    '/tools/family-caregiver-cost-calculator/',
    '/tools/care-facility-cost-comparison/',
    '/tools/advance-directive-healthcare-poa-guide/',
    // Staying Independent
    '/tools/local-senior-transportation-finder/',
    '/tools/smartphone-video-call-setup-guide/',
    '/tools/telehealth-how-it-works/',
    '/tools/fall-risk-home-safety-checklist/',
    // Later-Life & Estate Basics
    '/tools/simple-will-estate-basics-explainer/',
    '/tools/funeral-cost-planning-checklist/',
    '/tools/probate-timeline-explainer/',
    // Social Security
    '/tools/social-security-full-retirement-age-calculator/',
    '/tools/social-security-benefits-estimator/',
    '/tools/social-security-break-even-calculator/',
    '/tools/ssa-earnings-test-calculator/',
    '/tools/social-security-spousal-benefit-calculator/',
    '/tools/social-security-survivor-benefit-calculator/',
    '/tools/should-i-delay-social-security/',
    '/tools/social-security-cola-estimator/',
    '/tools/ssdi-estimate-calculator/',
    // Medicare Premiums & Enrollment
    '/tools/magi-for-medicare-calculator/',
    '/tools/medicare-irmaa-calculator/',
    '/tools/medicare-premium-calculator/',
    '/tools/medicare-late-enrollment-penalty-calculator/',
    '/tools/medicare-part-d-late-enrollment-penalty-calculator/',
    '/tools/medicare-enrollment-deadline-calculator/',
    '/tools/medicare-effective-date-calculator/',
    '/tools/should-i-appeal-my-irmaa/',
    '/tools/irmaa-appeal-letter-generator/',
    // Medicare Plan Comparison
    '/tools/medicare-advantage-comparison-tool/',
    '/tools/medigap-comparison-tool/',
    '/tools/medicare-donut-hole-calculator/',
    '/tools/medicare-savings-estimator/',
    '/tools/extra-help-eligibility-calculator/',
    // Retirement Planning
    '/tools/rmd-calculator/',
    '/tools/roth-conversion-calculator/',
    '/tools/ira-401k-withdrawal-planner/',
    '/tools/retirement-tax-estimator/',
    '/tools/retirement-tax-withholding-calculator/',
    // IRS Notice Decoders
    '/tools/irs-cp14-notice-decoder/',
    '/tools/irs-cp504-notice-decoder/',
    '/tools/irs-lt11-notice-decoder/',
    '/tools/irs-cp90-notice-decoder/',
    '/tools/irs-cp2000-response-guide/',
    // Category hub pages
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

  // Helper to determine priority by page type
  const getPagePriority = (page: string) => {
    if (page === '') return '1.0';
    const hubs = ['/medicare/', '/social-security/', '/irs/', '/retirement/', '/medicaid/', '/tools/'];
    if (hubs.includes(page)) return '0.9';
    if (page.startsWith('/tools/')) return '0.8';
    if (['/about/', '/contact/', '/privacy-policy/', '/disclaimer/', '/terms-of-use/'].includes(page)) return '0.5';
    return '0.7';
  };

  const urls = [
    // Static pages
    ...staticPages.map(page => ({
      loc: `${siteUrl}${page}`,
      lastmod: new Date().toISOString().split('T')[0], // current date
      changefreq: page === '' ? 'daily' : 'weekly',
      priority: getPagePriority(page)
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

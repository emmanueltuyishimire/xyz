import { getCollection } from 'astro:content';

export const prerender = true;

export async function GET() {
  const now = new Date();

  // Fetch all collections — only published, non-draft entries
  const medicare       = await getCollection('medicare',         ({ data }) => data.draft !== true && new Date(data.publishDate) <= now);
  const medicaid       = await getCollection('medicaid',         ({ data }) => data.draft !== true && new Date(data.publishDate) <= now);
  const blog           = await getCollection('blog',             ({ data }) => data.draft !== true && new Date(data.publishDate) <= now);
  const irs            = await getCollection('irs',              ({ data }) => data.draft !== true && new Date(data.publishDate) <= now);
  const retirement     = await getCollection('retirement',       ({ data }) => data.draft !== true && new Date(data.publishDate) <= now);
  const socialSecurity = await getCollection('social-security',  ({ data }) => data.draft !== true && new Date(data.publishDate) <= now);
  const taxes          = await getCollection('taxes',            ({ data }) => data.draft !== true && new Date(data.publishDate) <= now);

  const siteUrl = 'https://www.seniorsaudit.com';

  // Meaningful last-modified dates — avoid "today" for pages that don't change daily
  const SITE_LAUNCH  = '2026-01-15';
  const TOOLS_UPDATE = '2026-09-09';
  const HUBS_UPDATE  = '2026-09-09';
  const HOME_UPDATE  = '2026-09-09';

  // ---------------------------------------------------------------------------
  // 1. Core / utility pages
  // ---------------------------------------------------------------------------
  const utilityPages = [
    { path: '/',                    lastmod: HOME_UPDATE,  changefreq: 'daily',   priority: '1.0' },
    { path: '/about/',              lastmod: SITE_LAUNCH,  changefreq: 'monthly', priority: '0.6' },
    { path: '/about/emmanuel-tuyishimire/',   lastmod: SITE_LAUNCH,  changefreq: 'monthly', priority: '0.7' },
    { path: '/contact/',            lastmod: SITE_LAUNCH,  changefreq: 'yearly',  priority: '0.5' },
    { path: '/privacy-policy/',     lastmod: SITE_LAUNCH,  changefreq: 'yearly',  priority: '0.4' },
    { path: '/disclaimer/',         lastmod: SITE_LAUNCH,  changefreq: 'yearly',  priority: '0.4' },
    { path: '/terms-of-use/',       lastmod: SITE_LAUNCH,  changefreq: 'yearly',  priority: '0.4' },
  ];

  // ---------------------------------------------------------------------------
  // 2. Hub / category pages
  // ---------------------------------------------------------------------------
  const hubPages = [
    { path: '/tools/',                        priority: '0.9' },
    { path: '/medicare/',                     priority: '0.9' },
    { path: '/medicare/basics/',              priority: '0.8' },
    { path: '/medicare/enrollment/',          priority: '0.8' },
    { path: '/medicare/plan-comparison/',     priority: '0.8' },
    { path: '/medicare/medicare-advantage/',  priority: '0.8' },
    { path: '/medicare/costs-and-penalties/', priority: '0.8' },
    { path: '/medicare/part-d/',              priority: '0.8' },
    { path: '/medicare/at-65/',               priority: '0.7' },
    { path: '/medicare/costs/',               priority: '0.7' },
    { path: '/medicare/problems/',            priority: '0.7' },
    { path: '/social-security/',              priority: '0.9' },
    { path: '/medicaid/',                     priority: '0.8' },
    { path: '/irs/',                          priority: '0.8' },
    { path: '/retirement/',                   priority: '0.8' },
    { path: '/taxes/',                        priority: '0.7' },
    { path: '/blog/',                         priority: '0.7' },
    { path: '/educational-videos/',           priority: '0.8' },
  ].map(p => ({ ...p, lastmod: HUBS_UPDATE, changefreq: 'weekly' }));

  // ---------------------------------------------------------------------------
  // 3. Tool pages — grouped by category
  // ---------------------------------------------------------------------------
  const toolPaths = [
    // Social Security
    '/tools/social-security-full-retirement-age-calculator/',
    '/tools/social-security-benefits-calculator/',
    '/tools/social-security-break-even-calculator/',
    '/tools/ssa-earnings-test-calculator/',
    '/tools/social-security-spousal-benefit-calculator/',
    '/tools/social-security-survivor-benefit-calculator/',
    '/tools/should-i-delay-social-security/',
    '/tools/social-security-cola-calculator/',
    '/tools/ssdi-estimate-calculator/',
    '/tools/social-security-benefit-cap-proposal/',
    // Medicare Premiums & Enrollment
    '/tools/magi-for-medicare-calculator/',
    '/tools/medicare-irmaa-calculator/',
    '/tools/medicare-premium-calculator/',
    '/tools/medicare-late-enrollment-penalty-calculator/',
    '/tools/medicare-part-d-late-enrollment-penalty-calculator/',
    '/tools/medicare-enrollment-deadline-calculator/',
    '/tools/medicare-effective-date-calculator/',
    '/tools/irmaa-bracket-finder/',
    '/tools/should-i-appeal-my-irmaa/',
    '/tools/irmaa-appeal-letter-generator/',
    // Medicare Plan Comparison
    '/tools/medicare-part-b-coverage-checker/',
    '/tools/medicare-advantage-vs-original-medicare-cost-checker/',
    '/tools/medicare-advantage-vs-original-medicare-decision-helper/',
    '/tools/medicare-at-65-decision-checklist/',
    '/tools/medigap-comparison-tool/',
    '/tools/medigap-plan-g-vs-plan-n-calculator/',
    '/tools/original-medicare-medigap-part-d-cost-estimator/',
    '/tools/medicare-donut-hole-calculator/',
    '/tools/medicare-savings-estimator/',
    '/tools/medicare-worst-case-exposure-calculator/',
    '/tools/medicare-prescription-drug-cost-estimator/',
    '/tools/extra-help-eligibility-calculator/',
    // IRS Notices
    '/tools/cp14-notice/',
    '/tools/cp504-notice/',
    '/tools/irs-lt11-notice-decoder/',
    '/tools/irs-cp90-notice-decoder/',
    '/tools/cp2000-response-letter-sample/',
    // Retirement Planning
    '/tools/401k-withdrawal-tax-calculator/',
    '/tools/rmd-tax-withholding-calculator/',
    '/tools/social-security-tax-calculator/',
    '/tools/social-security-tax-withholding-calculator/',
    '/tools/retirement-tax-calculator-by-state/',
    '/tools/rmd-calculator/',
    '/tools/roth-conversion-calculator/',
    '/tools/ira-withdrawal-tax-calculator/',
    '/tools/ira-401k-withdrawal-planner/',
    '/tools/retirement-tax-calculator/',
    '/tools/retirement-tax-withholding-calculator/',
    '/tools/irs-tax-refund-estimator/',
    // Scam & Fraud Protection
    '/tools/scam-message-call-decoder/',
    '/tools/is-this-real-letter-checker/',
    '/tools/robocall-caller-id-guide/',
    '/tools/gift-card-wire-transfer-scam-checklist/',
    '/tools/romance-scam-red-flag-checklist/',
    '/tools/ai-voice-clone-grandkid-scam-verification/',
    '/tools/family-trusted-contact-setup-guide/',
    // Benefits & Assistance
    '/tools/universal-senior-benefits-screener/',
    '/tools/medicaid-eligibility-calculator/',
    '/tools/medicaid-spend-down-calculator/',
    '/tools/snap-eligibility-calculator-for-seniors/',
    '/tools/liheap-eligibility-checker/',
    '/tools/property-tax-relief-checker/',
    '/tools/senior-discount-finder/',
    // Medical Bills
    '/tools/hospital-bill-line-item-checker/',
    '/tools/how-to-dispute-a-medical-bill/',
    '/tools/prescription-price-comparison-guide/',
    // Caregiver Support
    '/tools/do-i-need-care-options-wizard/',
    '/tools/long-term-care-savings-runway-calculator/',
    '/tools/family-caregiver-cost-calculator/',
    '/tools/care-facility-cost-comparison/',
    '/tools/advance-directive-healthcare-poa-guide/',
    // Staying Independent
    '/tools/local-senior-transportation-finder/',
    '/tools/smartphone-video-call-setup-guide/',
    '/tools/telehealth-how-it-works/',
    '/tools/fall-risk-home-safety-checklist/',
    // Estate Basics
    '/tools/simple-will-estate-basics-explainer/',
    '/tools/funeral-cost-planning-checklist/',
    '/tools/probate-timeline-explainer/',
  ];
  const toolPages = toolPaths.map(path => ({
    path,
    lastmod: TOOLS_UPDATE,
    changefreq: 'monthly',
    priority: '0.8',
  }));

  // ---------------------------------------------------------------------------
  // 4. Dynamic collection articles — real lastmod from content frontmatter
  // ---------------------------------------------------------------------------
  const mapEntries = (collectionName: string, entries: any[]) =>
    entries.map(entry => ({
      path: `/${collectionName}/${entry.id}/`,
      lastmod: new Date(entry.data.updatedDate || entry.data.publishDate).toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.7',
    }));

  // Flatten all URL groups into one list
  const allUrls = [
    ...utilityPages,
    ...hubPages,
    ...toolPages,
    ...mapEntries('medicare',        medicare),
    ...mapEntries('medicaid',        medicaid),
    ...mapEntries('blog',            blog),
    ...mapEntries('irs',             irs),
    ...mapEntries('retirement',      retirement),
    ...mapEntries('social-security', socialSecurity),
    ...mapEntries('taxes',           taxes),
  ].map(p => ({ loc: `${siteUrl}${p.path}`, ...p }));

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allUrls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Cache on CDN for 24 hours; edge caches refresh daily
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      // Sitemap itself should not be indexed as a page
      'X-Robots-Tag': 'noindex',
    },
  });
}

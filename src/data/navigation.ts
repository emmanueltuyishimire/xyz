/**
 * src/data/navigation.ts
 * Single source of truth for all site navigation.
 *
 * Header strategy (5 items â€” no Search/Contact buttons):
 *   Tools & Calculators | Social Security | Medicare & Medicaid | IRS Notices | Retirement & Taxes
 *
 * Learn + secondary links â†’ footer only (footerOnlySections)
 */

export interface NavLink {
  label: string;
  href: string;
  desc?: string;
  isPaid?: boolean;
}

export interface NavGroup {
  heading: string;
  links: NavLink[];
}

export interface ToolCategoryAnchor {
  id: string;
  title: string;
  desc: string;
  href: string;
}

export interface MegaMenuData {
  featured: NavLink[];
  categories: ToolCategoryAnchor[];
  viewAllLink: {
    label: string;
    href: string;
  };
}

export interface TopNavItem {
  id: string;
  label: string;
  href: string;
  type: 'mega' | 'dropdown' | 'link';
  megaData?: MegaMenuData;
  groups?: NavGroup[];
}

// â”€â”€â”€ Tool category anchors (used in mega-menu) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const toolCategoryAnchors: ToolCategoryAnchor[] = [
  { id: 'social-security',           title: 'Social Security',              desc: 'Retirement benefits, break-even ages, spousal checks & SSDI',       href: '/tools/#social-security' },
  { id: 'medicare-premiums-enrollment', title: 'Medicare Premiums & Enrollment', desc: 'Part A & B costs, IRMAA tiers, deadlines & penalties',            href: '/tools/#medicare-premiums-enrollment' },
  { id: 'medicare-plan-comparison',  title: 'Medicare Plan Comparison',     desc: 'Original Medicare vs. Advantage, Medigap Plan G/N & Part D',        href: '/tools/#medicare-plan-comparison' },
  { id: 'retirement-planning',       title: 'Retirement Planning',          desc: '401(k) and IRA withdrawals, RMD tables & state taxes',              href: '/tools/#retirement-planning' },
  { id: 'irs-notices',               title: 'IRS Notices',                  desc: 'Decoders for CP14, CP504, LT11, CP90 & CP2000 letters',             href: '/tools/#irs-notices' },
  { id: 'medical-bills',             title: 'Medical Bills & Debt',         desc: 'Hospital bill checking, dispute steps & prescription pricing',       href: '/tools/#medical-bills' },
  { id: 'unclaimed-benefits',        title: 'Unclaimed Senior Benefits',    desc: 'Benefits screener, SNAP food assistance & LIHEAP energy aid',       href: '/tools/#unclaimed-benefits' },
  { id: 'scam-protection',           title: 'Scam & Fraud Protection',      desc: 'Suspicious call decoder, fake letter verification & robocalls',     href: '/tools/#scam-protection' },
  { id: 'caregiver-family',          title: 'Caregiver & Family Support',   desc: 'Caregiver expenses, care options wizard & healthcare POA',          href: '/tools/#caregiver-family' },
  { id: 'staying-independent',       title: 'Staying Independent',          desc: 'Senior transportation, home fall safety & telehealth guide',        href: '/tools/#staying-independent' },
  { id: 'later-life-estate',         title: 'Estate & Later Life',          desc: 'Simple will basics, probate timelines & funeral costs',             href: '/tools/#later-life-estate' },
];

// â”€â”€â”€ Most-used tools (mega-menu featured column) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const mostUsedTools: NavLink[] = [
  { label: 'Full Retirement Age Calculator',  href: '/tools/social-security-full-retirement-age-calculator/', desc: 'Find your exact FRA by birth year' },
  { label: 'Medicare Premium Calculator',     href: '/tools/medicare-premium-calculator/',                   desc: 'Part A, B & IRMAA total costs' },
  { label: 'IRMAA Surcharge Calculator',      href: '/tools/medicare-irmaa-calculator/',                    desc: 'See if your income triggers a surcharge' },
  { label: 'RMD Calculator',                  href: '/tools/rmd-calculator/',                               desc: 'Mandatory withdrawals from IRA / 401(k)' },
  { label: 'Scam Message & Call Decoder',     href: '/tools/scam-message-call-decoder/',                    desc: 'Verify suspicious text or call now' },
  { label: 'Universal Benefits Screener',     href: '/tools/universal-senior-benefits-screener/',           desc: 'Find programs you may be missing' },
];

// â”€â”€â”€ HEADER NAV â€” 5 items, no Search / Contact utility buttons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const mainNavigation: TopNavItem[] = [
  // 1. Tools & Calculators (mega-menu)
  {
    id: 'tools',
    label: 'Tools & Calculators',
    href: '/tools/',
    type: 'mega',
    megaData: {
      featured: mostUsedTools,
      categories: toolCategoryAnchors,
      viewAllLink: { label: 'View all 80 tools & calculators →', href: '/tools/' },
    },
  },

  // 2. Social Security
  {
    id: 'social-security',
    label: 'Social Security',
    href: '/social-security/',
    type: 'dropdown',
    groups: [
      {
        heading: 'Guides & Overview',
        links: [
          { label: 'Social Security Hub',                   href: '/social-security/',                                  desc: 'Complete 2026 guide to rules and claiming' },
          { label: 'Full Retirement Age Guide',             href: '/social-security/full-retirement-age-guide/',        desc: 'How your birth year sets your reduction or credits' },
          { label: 'How Much Will I Get?',                  href: '/social-security/how-much-social-security-will-i-get/', desc: 'The 35-year formula with concrete examples' },
          { label: '2026 COLA Update',                      href: '/social-security/social-security-cola-2026/',        desc: 'How the 2.8% increase affects your monthly check' },
        ],
      },
      {
        heading: 'Popular Calculators',
        links: [
          { label: 'Full Retirement Age Calculator',        href: '/tools/social-security-full-retirement-age-calculator/', desc: 'Age 62, FRA, and 70 monthly differences' },
          { label: 'Social Security Benefits Calculator',   href: '/tools/social-security-benefits-calculator/',        desc: 'Estimate benefits from your earnings history' },
          { label: 'Break-Even Calculator',                 href: '/tools/social-security-break-even-calculator/',     desc: 'Find the age where waiting to claim pays off' },
        ],
      },
    ],
  },

  // 3. Medicare & Medicaid
  {
    id: 'medicare-medicaid',
    label: 'Medicare & Medicaid',
    href: '/medicare/',
    type: 'dropdown',
    groups: [
      {
        heading: 'Medicare Guides',
        links: [
          { label: 'Medicare Overview Hub',         href: '/medicare/',                   desc: 'Master guide to Parts A, B, C, and D' },
          { label: 'Medicare Basics',               href: '/medicare/basics/',            desc: 'What Medicare covers, deductibles & enrollment' },
          { label: 'Enrollment & Deadlines',        href: '/medicare/enrollment/',        desc: 'Initial enrollment periods and penalty avoidance' },
          { label: 'Plan Comparison',               href: '/medicare/plan-comparison/',   desc: 'Original Medicare vs. Medicare Advantage' },
          { label: 'Medicare Advantage Plans',      href: '/medicare/medicare-advantage/',desc: 'Networks, out-of-pocket max and trade-offs' },
          { label: 'Medicare Costs 2026',           href: '/medicare/costs/',             desc: 'Premiums, deductibles, coinsurance & IRMAA' },
          { label: 'Turning 65 Checklist',          href: '/medicare/at-65/',             desc: 'Step-by-step timeline starting 6 months before 65' },
          { label: 'Denials & Appeals',             href: '/medicare/problems/',          desc: 'How to appeal denied coverage decisions' },
        ],
      },
      {
        heading: 'Medicaid & Savings Programs',
        links: [
          { label: 'Medicaid Eligibility Hub',      href: '/medicaid/',                              desc: 'State rules, income limits & asset guidelines' },
          { label: 'Medicaid Eligibility Calculator', href: '/tools/medicaid-eligibility-calculator/', desc: 'Check 2026 Aged, Blind & Disabled income and asset limits' },
          { label: 'Who Qualifies for Medicaid?',   href: '/medicaid/who-qualifies-for-medicaid/',   desc: 'Income criteria, asset limits and lookback periods' },
          { label: 'Medicare Savings Programs',     href: '/medicaid/medicaid-savings-programs/',    desc: 'QMB, SLMB, and QI help paying Medicare premiums' },
          { label: 'Medicaid Changes 2026',         href: '/medicaid/medicaid-cuts-2026/',           desc: 'Recent policy updates affecting senior coverage' },
        ],
      },
    ],
  },

  // 4. IRS Notices
  {
    id: 'irs-notices',
    label: 'IRS Notices',
    href: '/irs/',
    type: 'dropdown',
    groups: [
      {
        heading: 'IRS Notice Guides',
        links: [
          { label: 'IRS Notices Hub',               href: '/irs/',                          desc: 'How to read, verify, and resolve IRS letters safely' },
          { label: 'What Is a CP2000 Notice?',      href: '/irs/what-is-a-cp2000-notice/', desc: 'Proposed tax changes, 30-day deadlines & dispute steps' },
        ],
      },
      {
        heading: 'Notice Decoders',
        links: [
          { label: 'CP14 Notice Decoder',           href: '/tools/cp14-notice/',                    desc: 'Balance due notices and payment options' },
          { label: 'CP504 Notice Decoder',          href: '/tools/cp504-notice/',                   desc: 'Final notice before state refund levy action' },
          { label: 'LT11 Final Notice Decoder',     href: '/tools/irs-lt11-notice-decoder/',        desc: '30-day levy rights and how to respond' },
          { label: 'CP90 Levy Notice Decoder',      href: '/tools/irs-cp90-notice-decoder/',        desc: 'Collection Due Process rights & hearing request' },
          { label: 'CP2000 Dispute Letter Tool',    href: '/tools/cp2000-response-letter-sample/',  desc: 'Generate a customized written dispute letter' },
        ],
      },
    ],
  },

  // 5. Retirement & Taxes
  {
    id: 'retirement-taxes',
    label: 'Retirement & Taxes',
    href: '/retirement/',
    type: 'dropdown',
    groups: [
      {
        heading: 'Planning Hubs',
        links: [
          { label: 'Retirement Planning Hub',       href: '/retirement/', desc: 'RMD rules, withdrawal order, and tax management' },
          { label: 'Taxes in Retirement Hub',       href: '/taxes/',      desc: 'How Social Security, pensions, and IRAs are taxed' },
        ],
      },
      {
        heading: 'Guides & Calculators',
        links: [
          { label: 'Mandatory RMD Rules Guide',         href: '/retirement/rmd-mandatory-withdrawing/',  desc: 'Age 73 if born 1951-1959; age 75 if born 1960 or later — deadlines, tables, penalties' },
          { label: 'Retirement Tax Withholding Guide',  href: '/taxes/retirement-tax-withholding/',      desc: 'Avoid underpayment penalties on pensions & IRAs' },
          { label: 'RMD Calculator by Age',             href: '/tools/rmd-calculator/',                  desc: 'Calculate mandatory withdrawals under IRS tables' },
          { label: 'Roth Conversion Calculator',        href: '/tools/roth-conversion-calculator/',      desc: 'Model tax impact and avoid IRMAA bracket spikes' },
        ],
      },
    ],
  },
];

// â”€â”€â”€ No utility links â€” Search and Contact removed from header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const utilityLinks = null;

// â”€â”€â”€ Footer: full learning hubs list â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const footerLearningHubs = [
  { label: 'Tools & Calculators',  href: '/tools/' },
  { label: 'Social Security',      href: '/social-security/' },
  { label: 'Medicare',             href: '/medicare/' },
  { label: 'Medicaid & Savings',   href: '/medicaid/' },
  { label: 'IRS Notices',          href: '/irs/' },
  { label: 'Retirement Planning',  href: '/retirement/' },
  { label: 'Taxes in Retirement',  href: '/taxes/' },
  { label: 'Learning Center',      href: '/blog/' },
  { label: 'Educational Videos',   href: '/educational-videos/' },
  { label: 'Workbooks & Planners', href: '/resources/' },
];

// â”€â”€â”€ Footer-only sections (Learn + secondary links not in header) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const footerOnlySections = [
  {
    title: 'Learn & Resources',
    links: [
      { label: 'Learning Center',       href: '/blog/' },
      { label: 'Educational Videos',    href: '/educational-videos/' },
      { label: 'Workbooks & Planners',  href: '/resources/' },
    ],
  },
  {
    title: 'About & Help',
    links: [
      { label: 'About Seniors Audit',         href: '/about/' },
      { label: 'About Emmanuel Tuyishimire',  href: '/about/emmanuel-tuyishimire/' },
      { label: 'Contact Us',                  href: '/contact/' },
      { label: 'Search',                      href: '/search/' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy',    href: '/privacy-policy/' },
      { label: 'Terms of Use',      href: '/terms-of-use/' },
      { label: 'General Disclaimer',href: '/disclaimer/' },
    ],
  },
];

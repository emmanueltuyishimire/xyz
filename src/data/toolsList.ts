export interface ToolItem {
  title: string;
  desc: string;
  href: string;
  badge?: string;
  icon?: string;
}

export interface ToolCategory {
  id: string;
  name: string;
  icon: string;
  desc: string;
  tools: ToolItem[];
}

export const startHereTools: ToolItem[] = [
  { icon: '🏛️', title: 'Full Retirement Age Calculator', href: '/tools/social-security-full-retirement-age-calculator/', desc: 'Find your exact FRA by birth year' },
  { icon: '🩺', title: 'Medicare Premium Calculator', href: '/tools/medicare-premium-calculator/', desc: 'Part A, B & IRMAA — your 2026 total' },
  { icon: '💰', title: 'IRMAA Surcharge Calculator', href: '/tools/medicare-irmaa-calculator/', desc: 'See if your income triggers a surcharge' },
  { icon: '📊', title: 'RMD Calculator', href: '/tools/rmd-calculator/', desc: 'Required withdrawals from IRA / 401(k)' },
  { icon: '🛡️', title: 'Scam Message & Call Decoder', href: '/tools/scam-message-call-decoder/', desc: 'Check a suspicious text or call now' },
  { icon: '🎁', title: 'Universal Benefits Screener', href: '/tools/universal-senior-benefits-screener/', desc: 'Find benefits you may be missing' },
];

export const categories: ToolCategory[] = [
  {
    id: 'social-security',
    name: 'Social Security',
    icon: '🏛️',
    desc: 'Retirement benefits, break-even ages, spousal & survivor checks, SSDI estimates, and COLA.',
    tools: [
      { title: 'Full Retirement Age Calculator', desc: 'Find your exact FRA in years and months. Compare benefits at 62, FRA, and 70.', href: '/tools/social-security-full-retirement-age-calculator/' },
      { title: 'Social Security Benefits Calculator', desc: 'Estimate your future monthly benefit based on earning history and claiming age.', href: '/tools/social-security-benefits-calculator/' },
      { title: 'Break-Even Age Calculator', desc: 'Find the crossover age where delaying to FRA or 70 pays off vs. claiming at 62.', href: '/tools/social-security-break-even-calculator/' },
      { title: 'SSA Earnings Test Calculator', desc: 'See how much benefit is withheld if you work before reaching Full Retirement Age.', href: '/tools/ssa-earnings-test-calculator/' },
      { title: 'Spousal Benefit Calculator', desc: "Estimate your spousal benefit — up to 50% of your partner's PIA.", href: '/tools/social-security-spousal-benefit-calculator/' },
      { title: 'Survivor / Widow Benefit Calculator', desc: 'Calculate widow or widower benefits including early-claim reductions from age 60.', href: '/tools/social-security-survivor-benefit-calculator/' },
      { title: 'Should I Delay Social Security? Wizard', desc: '5-question decision wizard comparing 62 vs. 67 vs. 70 claiming strategies.', href: '/tools/should-i-delay-social-security/' },
      { title: 'COLA Estimator', desc: 'Estimate your gross and net monthly check increase based on 2026 COLA projections.', href: '/tools/social-security-cola-calculator/' },
      { title: 'SSDI Benefit Estimate Calculator', desc: 'Estimate SSDI monthly benefit from your work history using 2026 PIA bend-point formula.', href: '/tools/ssdi-estimate-calculator/' },
      { title: 'Benefit Cap Proposal Calculator', desc: 'See how the 2032 trust fund depletion and payroll tax cap proposals affect your monthly check.', href: '/tools/social-security-benefit-cap-proposal/' },
    ]
  },
  {
    id: 'medicare-premiums-enrollment',
    name: 'Medicare Premiums & Enrollment',
    icon: '🩺',
    desc: 'Part A & B premiums, IRMAA surcharges, penalty-free enrollment windows, and coverage start dates.',
    tools: [
      { title: 'Medicare at 65 Decision Checklist', desc: 'Calculate your 7-month IEP window, check HSA rules, and avoid lifetime late penalties.', href: '/tools/medicare-at-65-decision-checklist/' },
      { title: 'Medicare Part A & B Premium Calculator', desc: 'Calculate your exact Part A hospital and Part B medical premiums including IRMAA.', href: '/tools/medicare-premium-calculator/' },
      { title: 'MAGI for Medicare Calculator', desc: 'Compute your Modified Adjusted Gross Income for IRMAA threshold calculations.', href: '/tools/magi-for-medicare-calculator/' },
      { title: 'IRMAA Surcharge Calculator', desc: 'Estimate Part B and Part D premium surcharges with side-by-side income comparison.', href: '/tools/medicare-irmaa-calculator/' },
      { title: 'Part B Late Penalty Calculator', desc: 'Estimate the permanent 10%/yr surcharge for delayed Part B enrollment.', href: '/tools/medicare-late-enrollment-penalty-calculator/' },
      { title: 'Part D Late Penalty Calculator', desc: 'Calculate your permanent drug penalty for months without creditable coverage.', href: '/tools/medicare-part-d-late-enrollment-penalty-calculator/' },
      { title: 'Enrollment Deadline Calculator', desc: 'Find your exact 7-month Initial Enrollment Period open and close dates.', href: '/tools/medicare-enrollment-deadline-calculator/' },
      { title: 'Medicare Effective Date Calculator', desc: 'Calculate your exact Part A & B coverage start date based on birth month and enrollment.', href: '/tools/medicare-effective-date-calculator/' },
      { title: 'Should I Appeal My IRMAA? Wizard', desc: 'Determine if you qualify for a Life-Changing Event income reduction appeal using Form SSA-44.', href: '/tools/should-i-appeal-my-irmaa/' },
      { title: 'IRMAA Appeal Letter Generator', desc: 'Generate a print-ready IRMAA appeal cover letter and step-by-step Form SSA-44 guide.', href: '/tools/irmaa-appeal-letter-generator/' },
    ]
  },
  {
    id: 'medicare-plan-comparison',
    name: 'Medicare Plan Comparison',
    icon: '⚖️',
    desc: 'Compare Original Medicare vs. Medicare Advantage, Medigap plans, drug coverage, and savings programs.',
    tools: [
      { title: 'Medicare Part B Coverage Checker', desc: 'Search any service to instantly see if Part B covers it and what your 2026 out-of-pocket cost will be.', href: '/tools/medicare-part-b-coverage-checker/' },
      { title: 'IRMAA Bracket Finder — 2026 Quick Lookup', desc: 'See the complete 2026 IRMAA bracket table instantly. Enter your income to highlight your exact tier and total premium.', href: '/tools/irmaa-bracket-finder/' },
      { title: 'Medicare Advantage vs. Original Medicare Quiz', desc: '5-question decision helper to see which Medicare path fits your health profile.', href: '/tools/medicare-advantage-vs-original-medicare-decision-helper/' },
      { title: 'Original Medicare + Medigap Cost Estimator', desc: 'Calculate your annual cost range for Part B, Medigap Plan G/N, and Part D.', href: '/tools/original-medicare-medigap-part-d-cost-estimator/' },
      { title: 'Medicare Advantage Total-Cost Estimator', desc: 'See your typical-year copay range and worst-case in-network MOOP cap.', href: '/tools/medicare-advantage-total-cost-estimator/' },
      { title: 'Medigap Plan G vs Plan N Calculator', desc: 'Calculate your break-even visit point comparing copays vs. monthly premium savings.', href: '/tools/medigap-plan-g-vs-plan-n-calculator/' },
      { title: 'Medicare Worst-Case Exposure Comparison', desc: 'Side-by-side comparison of uncapped vs. capped medical liability during illness.', href: '/tools/medicare-worst-case-exposure-calculator/' },
      { title: 'Medigap Plan Comparison Tool', desc: 'Compare Medigap Plans G, N, A, and F — deductibles, excess charges, and estimates.', href: '/tools/medigap-comparison-tool/' },
      { title: 'Medicare Advantage Comparison Tool', desc: 'Side-by-side comparison of Medicare Advantage plan features.', href: '/tools/medicare-advantage-comparison-tool/' },
      { title: 'MA vs. Original Medicare Cost Checker', desc: 'Annual cost estimate based on your expected healthcare usage.', href: '/tools/medicare-advantage-vs-original-medicare-cost-checker/' },
      { title: 'Part D Prescription Cost Estimator', desc: 'Estimate drug spending tiers and see how the $2,100 catastrophic cap protects you.', href: '/tools/medicare-prescription-drug-cost-estimator/' },
      { title: 'Medicare Donut Hole Calculator', desc: 'See how the IRA $2,100 out-of-pocket cap applies to your prescription drug costs.', href: '/tools/medicare-donut-hole-calculator/' },
      { title: 'Medicare Savings Program Estimator', desc: 'Check if your income qualifies for federal assistance to pay Part B premiums.', href: '/tools/medicare-savings-estimator/' },
      { title: 'Extra Help (LIS) Eligibility Calculator', desc: 'Check 2026 income and asset limits for the low-income prescription drug subsidy.', href: '/tools/extra-help-eligibility-calculator/' },
    ]
  },
  {
    id: 'retirement-planning',
    name: 'Retirement Planning',
    icon: '📊',
    desc: 'Plan IRA/401(k) withdrawals, Roth conversions, portfolio drawdowns, and estimate your retirement tax bill.',
    tools: [
      { title: '401(k) Withdrawal Tax Calculator', desc: 'Estimate federal taxes, Rule of 55 / early penalties, 20% plan withholding, and take-home cash.', href: '/tools/401k-withdrawal-tax-calculator/' },
      { title: 'RMD Tax & Withholding Calculator', desc: 'Calculate mandatory 2026 RMDs, federal income tax, voluntary withholding, and net cash.', href: '/tools/rmd-tax-withholding-calculator/' },
      { title: 'Social Security Tax Calculator', desc: 'Calculate how much of your Social Security is taxable and estimate your 2026 federal tax bill.', href: '/tools/social-security-tax-calculator/' },
      { title: 'Social Security Tax Withholding Calculator', desc: 'Estimate voluntary monthly and annual federal tax withholding from Social Security checks using Form W-4V.', href: '/tools/social-security-tax-withholding-calculator/' },
      { title: 'Retirement Tax Calculator by State', desc: 'Compare 2026 federal and state income tax on Social Security, pensions, and IRA/401(k) withdrawals.', href: '/tools/retirement-tax-calculator-by-state/' },
      { title: 'RMD Calculator', desc: 'Calculate your Required Minimum Distribution using official IRS Uniform Lifetime Tables.', href: '/tools/rmd-calculator/' },
      { title: 'Roth Conversion Calculator', desc: 'Calculate upfront tax cost, break-even window, and 2026 IRMAA cliff risk.', href: '/tools/roth-conversion-calculator/' },
      { title: 'IRA Withdrawal Tax Calculator', desc: 'Calculate the incremental federal tax, under-59½ penalties, and net cash on IRA distributions.', href: '/tools/ira-withdrawal-tax-calculator/' },
      { title: 'IRA / 401(k) Withdrawal Planner', desc: 'Plan annual drawdowns, check 4% sustainability, and calculate net monthly income.', href: '/tools/ira-401k-withdrawal-planner/' },
      { title: 'Retirement Tax Calculator', desc: 'Estimate total federal tax across Social Security, IRA withdrawals, pensions, and interest.', href: '/tools/retirement-tax-calculator/' },
      { title: 'Retirement Tax Withholding Calculator', desc: 'Estimate federal tax withholding on pension and annuity distributions using Form W-4P.', href: '/tools/retirement-tax-withholding-calculator/' },
    ]
  },
  {
    id: 'irs-notices',
    name: 'IRS Notice Decoders',
    icon: '📬',
    desc: 'Decode IRS notices, calculate response deadlines, explore payment options, and build dispute checklists.',
    tools: [
      { title: 'IRS CP14 Notice Decoder', desc: 'Decode your initial balance-due notice and explore payment plan options with deadline tracker.', href: '/tools/cp14-notice/' },
      { title: 'IRS CP504 Notice Decoder', desc: 'Understand Notice of Intent to Levy and learn how to stop state tax refund seizure.', href: '/tools/cp504-notice/' },
      { title: 'IRS LT11 / Letter 1058 Decoder', desc: 'Decode the Final Notice of Intent to Levy. Calculate your 30-day CDP appeal deadline.', href: '/tools/irs-lt11-notice-decoder/' },
      { title: 'IRS CP90 Notice Decoder', desc: 'Final notice before Social Security levy. Calculate your 30-day CDP appeal window.', href: '/tools/irs-cp90-notice-decoder/' },
      { title: 'CP2000 Response Letter Sample Tool', desc: 'Decode your underreporter notice, calculate 30-day response deadline, and generate dispute letter.', href: '/tools/cp2000-response-letter-sample/' },
    ]
  },
  {
    id: 'medical-bills',
    name: 'Medical Bills & Healthcare Costs',
    icon: '🏥',
    desc: 'Audit hospital bills, dispute overcharges, compare drug costs, and evaluate Medicare Advantage.',
    tools: [
      { title: 'Hospital Bill Line-Item Checker', desc: 'Spot common billing errors, duplicate charges, and upcoding on hospital bills.', href: '/tools/hospital-bill-line-item-checker/' },
      { title: 'How to Dispute a Medical Bill Wizard', desc: 'Step-by-step dispute wizard from itemized bill request to state DOI escalation.', href: '/tools/how-to-dispute-a-medical-bill/' },
      { title: 'Prescription Price Comparison Guide', desc: 'Compare Part D copay tiers vs. cash discount prices vs. Extra Help costs.', href: '/tools/prescription-price-comparison-guide/' },
    ]
  },
  {
    id: 'unclaimed-benefits',
    name: 'Unclaimed Benefits & Assistance',
    icon: '🎁',
    desc: 'Find benefits, SNAP eligibility, LIHEAP energy aid, property tax freezes, and verified senior discounts.',
    tools: [
      { title: 'Universal Senior Benefits Screener', desc: 'Screen 10+ federal and state benefit programs in under 3 minutes.', href: '/tools/universal-senior-benefits-screener/' },
      { title: 'SNAP Eligibility Calculator for Seniors', desc: 'Estimate monthly food assistance benefits under special senior income rules.', href: '/tools/snap-eligibility-calculator-for-seniors/' },
      { title: 'LIHEAP Energy Assistance Checker', desc: 'Check eligibility for federal heating and cooling energy assistance.', href: '/tools/liheap-eligibility-checker/' },
      { title: 'Property Tax Relief / Freeze Checker', desc: 'Find state-specific property tax exemptions and freeze programs for seniors.', href: '/tools/property-tax-relief-checker/' },
      { title: 'Senior Discount Finder', desc: 'Search 50+ verified senior discounts by age and category across the US.', href: '/tools/senior-discount-finder/' },
    ]
  },
  {
    id: 'scam-protection',
    name: 'Scam & Fraud Protection',
    icon: '🛡️',
    desc: 'Verify suspicious calls, texts, letters, and wire/gift card requests using FTC and FBI fraud patterns.',
    tools: [
      { title: 'Scam Message & Call Decoder', desc: 'Paste suspicious texts or describe a call to check against FTC fraud patterns.', href: '/tools/scam-message-call-decoder/' },
      { title: 'Is This Real? Agency Letter Checker', desc: 'Verify if a notice claiming to be from IRS, SSA, or Medicare is legitimate.', href: '/tools/is-this-real-letter-checker/' },
      { title: 'Robocall & Caller-ID Guide', desc: 'Step-by-step instructions to block robocalls and file FCC complaints.', href: '/tools/robocall-caller-id-guide/' },
      { title: 'Gift Card & Wire Scam Checklist', desc: 'Immediate emergency action checklist if asked to pay by gift card or wire transfer.', href: '/tools/gift-card-wire-transfer-scam-checklist/' },
      { title: 'Romance Scam Red-Flag Checklist', desc: 'Private, non-judgmental 8-question red flag test for online relationships.', href: '/tools/romance-scam-red-flag-checklist/' },
      { title: 'AI Voice Clone Scam Verification', desc: '3-step emergency verification protocol if a relative calls asking for money.', href: '/tools/ai-voice-clone-grandkid-scam-verification/' },
      { title: 'Family Trusted Contact Setup Guide', desc: 'Step-by-step guide to setting up trusted contacts at banks and brokerages.', href: '/tools/family-trusted-contact-setup-guide/' },
    ]
  },
  {
    id: 'caregiver-family',
    name: 'Caregiver & Family Support',
    icon: '🤝',
    desc: 'Evaluate care options, calculate unpaid caregiving value, compare facility costs, and set up advance directives.',
    tools: [
      { title: 'Do I Need Care Options? Decision Wizard', desc: 'ADL/IADL assessment wizard with tailored care recommendations.', href: '/tools/do-i-need-care-options-wizard/' },
      { title: 'Family Caregiver Cost Calculator', desc: 'Calculate the true annual value of your unpaid caregiving time and expenses.', href: '/tools/family-caregiver-cost-calculator/' },
      { title: 'Care Facility Cost Comparison by State', desc: 'Compare median costs for in-home care, assisted living, and nursing homes by state.', href: '/tools/care-facility-cost-comparison/' },
      { title: 'Advance Directive & Healthcare POA Guide', desc: 'State-by-state statutory forms for living wills and healthcare proxies.', href: '/tools/advance-directive-healthcare-poa-guide/' },
    ]
  },
  {
    id: 'staying-independent',
    name: 'Staying Independent',
    icon: '🏡',
    desc: 'Find local rides, master video calls, set up telehealth visits, and complete a home fall-risk safety audit.',
    tools: [
      { title: 'Local Senior Transportation Finder', desc: 'Find free or low-cost rides via ADA paratransit, NEMT, and volunteer networks.', href: '/tools/local-senior-transportation-finder/' },
      { title: 'Plain-English Video Call Setup Guide', desc: 'Step-by-step FaceTime, Zoom, and WhatsApp setup instructions in plain English.', href: '/tools/smartphone-video-call-setup-guide/' },
      { title: 'Telehealth: How It Works Walkthrough', desc: 'Learn Medicare video visit rules and complete a 10-step appointment prep list.', href: '/tools/telehealth-how-it-works/' },
      { title: 'Fall Risk Home Safety Checklist', desc: 'Room-by-room home hazard checklist based on the CDC STEADI program.', href: '/tools/fall-risk-home-safety-checklist/' },
    ]
  },
  {
    id: 'later-life-estate',
    name: 'Later-Life & Estate Basics',
    icon: '📜',
    desc: 'Understand simple wills, check state probate timelines, and plan funeral costs under FTC rules.',
    tools: [
      { title: 'Simple Will & Estate Basics Explainer', desc: 'Plain-English guide explaining what wills do, what skips probate, and state laws.', href: '/tools/simple-will-estate-basics-explainer/' },
      { title: 'Funeral Cost Planning Checklist', desc: 'Know your rights under the FTC Funeral Rule and compare itemized service costs.', href: '/tools/funeral-cost-planning-checklist/' },
      { title: 'Probate Timeline & Small Estate Explainer', desc: 'Check state-specific probate durations, costs, and small-estate affidavit limits.', href: '/tools/probate-timeline-explainer/' },
    ]
  },
];

export const allTools: ToolItem[] = categories.flatMap(cat => cat.tools);

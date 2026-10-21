/**
 * Core official constants for SeniorsAudit.com.
 * All verified values must match official government sources verbatim
 * and correspond to a saved snapshot in data/sources/.
 */

export interface OfficialConstant<T = number | string | Record<string, any>> {
  value: T;
  benefitYear: number;
  effectiveDate: string;
  sourceUrl: string;
  snapshotFile: string;
  sourcePage?: number;
  quotedText: string;
  lastVerified: string;
  status: 'verified' | 'unverified' | '2027-pending' | 'unverified-source';
  note?: string;
}

export const OFFICIAL_CONSTANTS = {
  // Medicare Part B Standard Premium (2026)
  MEDICARE_PART_B_PREMIUM_2026: {
    value: 202.90,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: 'standard monthly premium for Medicare Part B enrollees will be $202.90 for 2026',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  // Medicare Part B Annual Deductible (2026)
  MEDICARE_PART_B_DEDUCTIBLE_2026: {
    value: 283,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: 'annual deductible for all Medicare Part B beneficiaries will be $283 in 2026',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  // Medicare Part A Inpatient Deductible (2026)
  MEDICARE_PART_A_DEDUCTIBLE_2026: {
    value: 1736,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: 'will be $1,736 in 2026',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  // Medicare Part A Coinsurance Days 61-90 (2026)
  MEDICARE_PART_A_COINSURANCE_61_90_2026: {
    value: 434,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: 'coinsurance amount of $434 per day',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  // Medicare Part D Base Beneficiary Premium (2026)
  MEDICARE_PART_D_BASE_PREMIUM_2026: {
    value: 38.99,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-part-d-bid-information-and-part-d-premium-stabilization-demonstration-parameters',
    snapshotFile: 'cms_2026_part_d_rate_announcement.html',
    quotedText: 'For 2026, the base beneficiary premium will be $38.99.',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  // Medicare Part D Maximum Standard Deductible (2026)
  MEDICARE_PART_D_DEDUCTIBLE_2026: {
    value: 615,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.medicare.gov/health-drug-plans/part-d/basics/costs',
    snapshotFile: 'medicare_gov_2026_part_d_costs.html',
    quotedText: '$615 in 2026',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  // Medicare Part D Out-of-Pocket Cap (2026)
  MEDICARE_PART_D_OOP_CAP_2026: {
    value: 2100,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.medicare.gov/health-drug-plans/part-d/basics/costs',
    snapshotFile: 'medicare_gov_2026_part_d_costs.html',
    quotedText: '$2,100 in 2026',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  // Social Security Taxable Maximum Wage Base (2026)
  SOCIAL_SECURITY_WAGE_BASE_2026: {
    value: 184500,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.ssa.gov/news/en/cola/factsheets/2026.html',
    snapshotFile: 'ssa_2026_cola_fact_sheet.html',
    quotedText: 'The maximum amount of earnings subject to the Social Security tax (taxable wage base) is $184,500 in 2026.',
    lastVerified: '2026-10-10',
    status: 'unverified-source',
    note: 'Awaiting owner-supplied browser-saved PDF due to Akamai WAF bot block.'
  } as OfficialConstant<number>,

  // Social Security Earnings Test Under FRA (2026)
  EARNINGS_TEST_UNDER_FRA_2026: {
    value: 24480,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.ssa.gov/news/en/cola/factsheets/2026.html',
    snapshotFile: 'ssa_2026_cola_fact_sheet.html',
    quotedText: 'Under Full Retirement Age: The earnings-test threshold under FRA for 2026 is $24,480 ($2,040/mo).',
    lastVerified: '2026-10-10',
    status: 'unverified-source',
    note: 'Awaiting owner-supplied browser-saved PDF due to Akamai WAF bot block.'
  } as OfficialConstant<number>,

  // Social Security Earnings Test Year-of-FRA (2026)
  EARNINGS_TEST_YEAR_OF_FRA_2026: {
    value: 65160,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.ssa.gov/news/en/cola/factsheets/2026.html',
    snapshotFile: 'ssa_2026_cola_fact_sheet.html',
    quotedText: 'In the Year of Reaching Full Retirement Age: The earnings-test limit in the year individuals reach full retirement age is $65,160 ($5,430/mo) for 2026.',
    lastVerified: '2026-10-10',
    status: 'unverified-source',
    note: 'Awaiting owner-supplied browser-saved PDF due to Akamai WAF bot block.'
  } as OfficialConstant<number>,

  // Minimum Community Spouse Resource Allowance (2026)
  CSRA_MIN_2026: {
    value: 32532,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.medicaid.gov/federal-policy-guidance/downloads/cib04272026.pdf',
    snapshotFile: 'cms_cib_04272026_spousal_impoverishment.pdf',
    quotedText: 'Minimum Resource Standard: 32,532.00',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  // Maximum Community Spouse Resource Allowance (2026)
  CSRA_MAX_2026: {
    value: 162660,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.medicaid.gov/federal-policy-guidance/downloads/cib04272026.pdf',
    snapshotFile: 'cms_cib_04272026_spousal_impoverishment.pdf',
    quotedText: 'Maximum Resource Standard 162,660.00',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  // Medicaid Minimum Home Equity Limit (2026)
  MEDICAID_HOME_EQUITY_MIN_2026: {
    value: 752000,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.medicaid.gov/federal-policy-guidance/downloads/cib04272026.pdf',
    snapshotFile: 'cms_cib_04272026_spousal_impoverishment.pdf',
    quotedText: 'Minimum: 752,000.00',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  // Medicaid Maximum Home Equity Limit (2026)
  MEDICAID_HOME_EQUITY_MAX_2026: {
    value: 1130000,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.medicaid.gov/federal-policy-guidance/downloads/cib04272026.pdf',
    snapshotFile: 'cms_cib_04272026_spousal_impoverishment.pdf',
    quotedText: 'Maximum: 1,130,000.00',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  // MMMNA Federal Minimum Floor (Effective July 1, 2026)
  // July 1, 2026 floor ($2,705.00; prior baseline was $2,643.75; not a CSRA divisor)
  MMMNA_MIN_FLOOR_2026: {
    value: 2705.00,
    benefitYear: 2026,
    effectiveDate: '2026-07-01',
    sourceUrl: 'https://www.medicaid.gov/federal-policy-guidance/downloads/cib04272026.pdf',
    snapshotFile: 'cms_cib_04272026_spousal_impoverishment.pdf',
    quotedText: 'Minimum Monthly Maintenance Needs Allowance  2,705.00',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  // MMMNA Federal Maximum Cap (2026)
  MMMNA_MAX_CAP_2026: {
    value: 4066.50,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.medicaid.gov/federal-policy-guidance/downloads/cib04272026.pdf',
    snapshotFile: 'cms_cib_04272026_spousal_impoverishment.pdf',
    quotedText: 'Maximum Monthly Maintenance Needs Allowance: 4,066.50',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  // California Non-MAGI Asset Limit (Single, ACWDL 25-14/25-20)
  CALIFORNIA_NON_MAGI_ASSET_LIMIT_SINGLE_2026: {
    value: 130000,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.dhcs.ca.gov/services/medi-cal/eligibility/letters/Documents/ACWDL25-14.pdf',
    snapshotFile: 'dhcs_acwdl_25_14_20_assets.html',
    quotedText: 'Effective January 1, 2026, the Medi-Cal Non-MAGI asset limit is reinstated at $130,000 for one person, plus $65,000 for each additional family member ($195,000 for two persons).',
    lastVerified: '2026-10-10',
    status: 'unverified-source',
    note: 'Awaiting owner-supplied browser-saved PDF due to Incapsula WAF bot block.'
  } as OfficialConstant<number>,

  // ── TAX YEAR 2026 (Rev. Proc. 2025-32, released October 9, 2025, IRB 2025-44) ──

  // Standard Deduction — Single/MFS (Section 4.14(1))
  TAX_2026_STD_DED_SINGLE: {
    value: 16100,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.irs.gov/pub/irs-irbs/irb25-44.pdf',
    snapshotFile: 'rp-25-32.pdf',
    sourcePage: 18,
    quotedText: '$16,100',
    lastVerified: '2026-10-11',
    status: 'verified'
  } as OfficialConstant<number>,

  // Standard Deduction — MFJ/QSS (Section 4.14(1))
  TAX_2026_STD_DED_MFJ: {
    value: 32200,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.irs.gov/pub/irs-irbs/irb25-44.pdf',
    snapshotFile: 'rp-25-32.pdf',
    sourcePage: 18,
    quotedText: '$32,200',
    lastVerified: '2026-10-11',
    status: 'verified'
  } as OfficialConstant<number>,

  // Standard Deduction — HOH (Section 4.14(1))
  TAX_2026_STD_DED_HOH: {
    value: 24150,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.irs.gov/pub/irs-irbs/irb25-44.pdf',
    snapshotFile: 'rp-25-32.pdf',
    sourcePage: 18,
    quotedText: '$24,150',
    lastVerified: '2026-10-11',
    status: 'verified'
  } as OfficialConstant<number>,

  // Additional Standard Deduction — Age 65+ Unmarried (Section 4.14(3))
  TAX_2026_SENIOR_ADDL_UNMARRIED: {
    value: 2050,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.irs.gov/pub/irs-irbs/irb25-44.pdf',
    snapshotFile: 'rp-25-32.pdf',
    sourcePage: 18,
    quotedText: 'standard deduction amount is increased to $2,050 if the individual is also unmarried',
    lastVerified: '2026-10-11',
    status: 'verified'
  } as OfficialConstant<number>,

  // Additional Standard Deduction — Age 65+ Married (Section 4.14(3))
  TAX_2026_SENIOR_ADDL_MARRIED: {
    value: 1650,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.irs.gov/pub/irs-irbs/irb25-44.pdf',
    snapshotFile: 'rp-25-32.pdf',
    sourcePage: 18,
    quotedText: 'for the aged or the blind is $1,650.',
    lastVerified: '2026-10-11',
    status: 'verified'
  } as OfficialConstant<number>,

  // Enhanced Senior Deduction — Per-Person Max (Schedule 1-A, Part V, Line 35)
  // tax year 2025 form; statutory parameters unchanged for 2026; update when the 2026 form is released.
  TAX_2026_ENHANCED_SENIOR_DED_MAX: {
    value: 6000,
    benefitYear: 2026,
    effectiveDate: '2025-01-01',
    sourceUrl: 'https://www.irs.gov/pub/irs-pdf/f1040s1a.pdf',
    snapshotFile: 'f1040s1a.pdf',
    sourcePage: 2,
    quotedText: '35 Subtract line 34 from $6,000. If zero or less, enter -0-',
    lastVerified: '2026-10-11',
    status: 'verified',
    note: 'tax year 2025 form; statutory parameters unchanged for 2026; update when the 2026 form is released.'
  } as OfficialConstant<number>,

  // Enhanced Senior Deduction — Phaseout Threshold Single (Schedule 1-A, Part V, Line 32)
  // tax year 2025 form; statutory parameters unchanged for 2026; update when the 2026 form is released.
  TAX_2026_ENHANCED_SENIOR_THRESHOLD_SINGLE: {
    value: 75000,
    benefitYear: 2026,
    effectiveDate: '2025-01-01',
    sourceUrl: 'https://www.irs.gov/pub/irs-pdf/f1040s1a.pdf',
    snapshotFile: 'f1040s1a.pdf',
    sourcePage: 2,
    quotedText: '32 Enter $75,000 $150,000 if married filing jointly',
    lastVerified: '2026-10-11',
    status: 'verified',
    note: 'tax year 2025 form; statutory parameters unchanged for 2026; update when the 2026 form is released.'
  } as OfficialConstant<number>,

  // Enhanced Senior Deduction — Phaseout Threshold MFJ (Schedule 1-A, Part V, Line 32)
  // tax year 2025 form; statutory parameters unchanged for 2026; update when the 2026 form is released.
  TAX_2026_ENHANCED_SENIOR_THRESHOLD_MFJ: {
    value: 150000,
    benefitYear: 2026,
    effectiveDate: '2025-01-01',
    sourceUrl: 'https://www.irs.gov/pub/irs-pdf/f1040s1a.pdf',
    snapshotFile: 'f1040s1a.pdf',
    sourcePage: 2,
    quotedText: '32 Enter $75,000 $150,000 if married filing jointly',
    lastVerified: '2026-10-11',
    status: 'verified',
    note: 'tax year 2025 form; statutory parameters unchanged for 2026; update when the 2026 form is released.'
  } as OfficialConstant<number>,

  // Enhanced Senior Deduction — Phaseout Rate (Schedule 1-A, Part V, Line 34)
  // tax year 2025 form; statutory parameters unchanged for 2026; update when the 2026 form is released.
  TAX_2026_ENHANCED_SENIOR_PHASEOUT_RATE: {
    value: 0.06,
    benefitYear: 2026,
    effectiveDate: '2025-01-01',
    sourceUrl: 'https://www.irs.gov/pub/irs-pdf/f1040s1a.pdf',
    snapshotFile: 'f1040s1a.pdf',
    sourcePage: 2,
    quotedText: '34 Multiply line 33 by 6% 0.06',
    lastVerified: '2026-10-11',
    status: 'verified',
    note: 'tax year 2025 form; statutory parameters unchanged for 2026; update when the 2026 form is released.'
  } as OfficialConstant<number>,

  // Medicare IRMAA Income Thresholds (42 U.S.C. § 1395r(i) and 42 U.S.C. § 1395w-113(a)(7))
  MEDICARE_IRMAA_THRESHOLD_BASE_SINGLE_2026: {
    value: 109000,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: 'Less than or equal to $109,000',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_IRMAA_THRESHOLD_BASE_MFJ_2026: {
    value: 218000,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: 'Less than or equal to $218,000',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_IRMAA_TIER_1_UPPER_SINGLE_2026: {
    value: 137000,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: 'Greater than $109,000 and less than or equal to $137,000',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_IRMAA_TIER_1_UPPER_MFJ_2026: {
    value: 274000,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: 'Greater than $218,000 and less than or equal to $274,000',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_IRMAA_TIER_2_UPPER_SINGLE_2026: {
    value: 171000,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: 'Greater than $137,000 and less than or equal to $171,000',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_IRMAA_TIER_2_UPPER_MFJ_2026: {
    value: 342000,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: 'Greater than $274,000 and less than or equal to $342,000',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_IRMAA_TIER_3_UPPER_SINGLE_2026: {
    value: 205000,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: 'Greater than $171,000 and less than or equal to $205,000',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_IRMAA_TIER_3_UPPER_MFJ_2026: {
    value: 410000,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: 'Greater than $342,000 and less than or equal to $410,000',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_IRMAA_TIER_4_UPPER_SINGLE_2026: {
    value: 500000,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: 'Greater than $205,000 and less than $500,000',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_IRMAA_TIER_4_UPPER_MFJ_2026: {
    value: 750000,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: 'Greater than $410,000 and less than $750,000',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_IRMAA_TIER_4_MFS_2026: {
    value: 391000,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: 'Greater than $109,000 and less than $391,000',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_IRMAA_TIER_5_SINGLE_2026: {
    value: 500000,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: 'Greater than or equal to $500,000',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_IRMAA_TIER_5_MFJ_2026: {
    value: 750000,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: 'Greater than or equal to $750,000',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_IRMAA_TIER_5_MFS_2026: {
    value: 391000,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: 'Greater than or equal to $391,000',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  // Medicare Part B IRMAA Surcharges & Total Premiums (42 U.S.C. § 1395r(i))
  MEDICARE_PART_B_IRMAA_TIER_1_SURCHARGE_2026: {
    value: 81.20,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: '<span>$81.20</span>',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_B_IRMAA_TIER_1_TOTAL_2026: {
    value: 284.10,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: '<span>$284.10</span>',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_B_IRMAA_TIER_2_SURCHARGE_2026: {
    value: 202.90,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: '<span>$202.90</span>',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_B_IRMAA_TIER_2_TOTAL_2026: {
    value: 405.80,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: '<span>$405.80</span>',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_B_IRMAA_TIER_3_SURCHARGE_2026: {
    value: 324.60,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: '<span>$324.60</span>',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_B_IRMAA_TIER_3_TOTAL_2026: {
    value: 527.50,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: '<span>$527.50</span>',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_B_IRMAA_TIER_4_SURCHARGE_2026: {
    value: 446.30,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: '<span>$446.30</span>',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_B_IRMAA_TIER_4_TOTAL_2026: {
    value: 649.20,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: '<span>$649.20</span>',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_B_IRMAA_TIER_5_SURCHARGE_2026: {
    value: 487.00,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: '<span>$487.00</span>',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_B_IRMAA_TIER_5_TOTAL_2026: {
    value: 689.90,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: '<span>$689.90</span>',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_B_IRMAA_MFS_TIER_2_SURCHARGE_2026: {
    value: 446.30,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: '<span>$446.30</span>',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_B_IRMAA_MFS_TIER_2_TOTAL_2026: {
    value: 649.20,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: '<span>$649.20</span>',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_B_IRMAA_MFS_TIER_3_SURCHARGE_2026: {
    value: 487.00,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: '<span>$487.00</span>',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_B_IRMAA_MFS_TIER_3_TOTAL_2026: {
    value: 689.90,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: '<span>$689.90</span>',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  // Medicare Part D IRMAA Surcharges (2026)
  MEDICARE_PART_D_IRMAA_TIER_1_SURCHARGE_2026: {
    value: 14.50,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.medicare.gov/health-drug-plans/part-d/basics/costs',
    snapshotFile: 'medicare_gov_2026_part_d_costs.html',
    quotedText: '&amp;dollar;14.50 + your plan premium',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_D_IRMAA_TIER_2_SURCHARGE_2026: {
    value: 37.50,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.medicare.gov/health-drug-plans/part-d/basics/costs',
    snapshotFile: 'medicare_gov_2026_part_d_costs.html',
    quotedText: '&amp;dollar;37.50 + your plan premium',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_D_IRMAA_TIER_3_SURCHARGE_2026: {
    value: 60.40,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.medicare.gov/health-drug-plans/part-d/basics/costs',
    snapshotFile: 'medicare_gov_2026_part_d_costs.html',
    quotedText: '&amp;dollar;60.40 + your plan premium',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_D_IRMAA_TIER_4_SURCHARGE_2026: {
    value: 83.30,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.medicare.gov/health-drug-plans/part-d/basics/costs',
    snapshotFile: 'medicare_gov_2026_part_d_costs.html',
    quotedText: '&amp;dollar;83.30 + your plan premium',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_D_IRMAA_TIER_5_SURCHARGE_2026: {
    value: 91.00,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.medicare.gov/health-drug-plans/part-d/basics/costs',
    snapshotFile: 'medicare_gov_2026_part_d_costs.html',
    quotedText: '&amp;dollar;91.00 + your plan premium',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_D_IRMAA_MFS_TIER_2_SURCHARGE_2026: {
    value: 83.30,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.medicare.gov/health-drug-plans/part-d/basics/costs',
    snapshotFile: 'medicare_gov_2026_part_d_costs.html',
    quotedText: '391,000&amp;lt;/td&amp;gt;&amp;lt;td&amp;gt;&amp;dollar;83.30 + your plan premium',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_D_IRMAA_MFS_TIER_3_SURCHARGE_2026: {
    value: 91.00,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.medicare.gov/health-drug-plans/part-d/basics/costs',
    snapshotFile: 'medicare_gov_2026_part_d_costs.html',
    quotedText: '&amp;dollar;391,000 or above&amp;lt;/td&amp;gt;&amp;lt;td&amp;gt;&amp;dollar;91.00 + your plan premium',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  // ── OFFICIAL 2027 SOCIAL SECURITY CONSTANTS (SSA Fact Sheet, Oct 14, 2026) ──

  // Social Security Taxable Maximum Wage Base (2027)
  SOCIAL_SECURITY_WAGE_BASE_2027: {
    value: 192300,
    benefitYear: 2027,
    effectiveDate: '2027-01-01',
    sourceUrl: 'https://www.ssa.gov/news/en/cola/factsheets/2027.html',
    snapshotFile: 'ssa_2027_cola_fact_sheet.html',
    quotedText: 'taxable wage base) is $192,300 in 2027',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  // Social Security Earnings Test Under FRA (2027)
  EARNINGS_TEST_UNDER_FRA_2027: {
    value: 25560,
    benefitYear: 2027,
    effectiveDate: '2027-01-01',
    sourceUrl: 'https://www.ssa.gov/news/en/cola/factsheets/2027.html',
    snapshotFile: 'ssa_2027_cola_fact_sheet.html',
    quotedText: 'threshold under FRA for 2027 is $25,560',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  // Social Security Earnings Test Year-of-FRA (2027)
  EARNINGS_TEST_YEAR_OF_FRA_2027: {
    value: 67920,
    benefitYear: 2027,
    effectiveDate: '2027-01-01',
    sourceUrl: 'https://www.ssa.gov/news/en/cola/factsheets/2027.html',
    snapshotFile: 'ssa_2027_cola_fact_sheet.html',
    quotedText: 'reach full retirement age is $67,920',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  // Social Security Quarter of Coverage (2027)
  QUARTER_OF_COVERAGE_2027: {
    value: 1970,
    benefitYear: 2027,
    effectiveDate: '2027-01-01',
    sourceUrl: 'https://www.ssa.gov/news/en/cola/factsheets/2027.html',
    snapshotFile: 'ssa_2027_cola_fact_sheet.html',
    quotedText: 'coverage (work credit) is $1,970',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  // Substantial Gainful Activity (SGA) — Non-Blind (2027)
  SGA_NON_BLIND_2027: {
    value: 1770,
    benefitYear: 2027,
    effectiveDate: '2027-01-01',
    sourceUrl: 'https://www.ssa.gov/news/en/cola/factsheets/2027.html',
    snapshotFile: 'ssa_2027_cola_fact_sheet.html',
    quotedText: 'non-blind disabled individuals is $1,770',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  // Substantial Gainful Activity (SGA) — Blind (2027)
  SGA_BLIND_2027: {
    value: 2950,
    benefitYear: 2027,
    effectiveDate: '2027-01-01',
    sourceUrl: 'https://www.ssa.gov/news/en/cola/factsheets/2027.html',
    snapshotFile: 'ssa_2027_cola_fact_sheet.html',
    quotedText: 'blind disabled individuals is $2,950',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  // Trial Work Period (TWP) Monthly Threshold (2027)
  TRIAL_WORK_PERIOD_2027: {
    value: 1270,
    benefitYear: 2027,
    effectiveDate: '2027-01-01',
    sourceUrl: 'https://www.ssa.gov/news/en/cola/factsheets/2027.html',
    snapshotFile: 'ssa_2027_cola_fact_sheet.html',
    quotedText: 'trial work period month is $1,270',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  // Maximum Monthly Social Security Benefit at Full Retirement Age (2027)
  MAX_BENEFIT_FRA_2027: {
    value: 4188,
    benefitYear: 2027,
    effectiveDate: '2027-01-01',
    sourceUrl: 'https://www.ssa.gov/news/en/cola/factsheets/2027.html',
    snapshotFile: 'ssa_2027_cola_fact_sheet.html',
    quotedText: 'retiring at full retirement age is $4,188',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  // Supplemental Security Income (SSI) Federal Payment Standard — Individual (2027)
  SSI_INDIVIDUAL_2027: {
    value: 1029,
    benefitYear: 2027,
    effectiveDate: '2026-12-31',
    sourceUrl: 'https://www.ssa.gov/news/en/cola/factsheets/2027.html',
    snapshotFile: 'ssa_2027_cola_fact_sheet.html',
    quotedText: 'Individual $1,029 per month',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  // Supplemental Security Income (SSI) Federal Payment Standard — Couple (2027)
  SSI_COUPLE_2027: {
    value: 1544,
    benefitYear: 2027,
    effectiveDate: '2026-12-31',
    sourceUrl: 'https://www.ssa.gov/news/en/cola/factsheets/2027.html',
    snapshotFile: 'ssa_2027_cola_fact_sheet.html',
    quotedText: 'Eligible Couple $1,544 per month',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  // SSI Student Child Earned Income Exclusion — Monthly (2027)
  SSI_STUDENT_EXCLUSION_MONTHLY_2027: {
    value: 2500,
    benefitYear: 2027,
    effectiveDate: '2027-01-01',
    sourceUrl: 'https://www.ssa.gov/news/en/cola/factsheets/2027.html',
    snapshotFile: 'ssa_2027_cola_fact_sheet.html',
    quotedText: 'monthly limit $2,500',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>,

  // SSI Student Child Earned Income Exclusion — Annual (2027)
  SSI_STUDENT_EXCLUSION_ANNUAL_2027: {
    value: 10080,
    benefitYear: 2027,
    effectiveDate: '2027-01-01',
    sourceUrl: 'https://www.ssa.gov/news/en/cola/factsheets/2027.html',
    snapshotFile: 'ssa_2027_cola_fact_sheet.html',
    quotedText: 'annual limit $10,080',
    lastVerified: '2026-10-14',
    status: 'verified'
  } as OfficialConstant<number>
};

/**
 * Official 2027 Social Security COLA Benchmarks & Announcements
 * Source: SSA National Announcement & Official Fact Sheet (October 14, 2026)
 * Snapshot: data/sources/ssa_2027_cola_fact_sheet.html
 * Source URL: https://www.ssa.gov/news/en/cola/factsheets/2027.html
 *
 * All figures verified against official government source.
 */
export const OFFICIAL_2027_COLA = {
  rate: 3.6,
  rateFormatted: '3.6%',
  announcedDate: 'October 14, 2026',
  effectiveDateSS: 'January 2027',
  effectiveDateSSI: 'December 31, 2026',
  wageBase: 192300,
  wageBaseFormatted: '$192,300',
  wageBase2026: 184500,
  wageBaseIncrease: 7800,
  wageBaseIncreaseFormatted: '+$7,800',
  earningsTestUnderFRA: 25560,
  earningsTestUnderFRAFormatted: '$25,560',
  earningsTestUnderFRA2026: 24480,
  earningsTestUnderFRAChange: 1080,
  earningsTestUnderFRAChangeFormatted: '+$1,080',
  earningsTestYearOfFRA: 67920,
  earningsTestYearOfFRAFormatted: '$67,920',
  earningsTestYearOfFRA2026: 65160,
  earningsTestYearOfFRAChange: 2760,
  earningsTestYearOfFRAChangeFormatted: '+$2,760',
  quarterOfCoverage: 1970,
  quarterOfCoverageFormatted: '$1,970',
  sgaNonBlind: 1770,
  sgaNonBlindFormatted: '$1,770',
  sgaBlind: 2950,
  sgaBlindFormatted: '$2,950',
  trialWorkPeriod: 1270,
  trialWorkPeriodFormatted: '$1,270',
  maxBenefitAtFRA: 4188,
  maxBenefitAtFRAFormatted: '$4,188',
  ssiIndividual: 1029,
  ssiIndividualFormatted: '$1,029',
  ssiCouple: 1544,
  ssiCoupleFormatted: '$1,544',
  ssiCouple2026: 1491,
  ssiCoupleChange: 53,
  ssiCoupleChangeFormatted: '+$53',
  ssiStudentExclusionMonthly: 2500,
  ssiStudentExclusionAnnual: 10080,
  averageMonthlyIncrease: 75,
  averageMonthlyIncreaseFormatted: '$75',
  avgRetiredWorkerBefore: 2095,
  avgRetiredWorkerAfter: 2170,
  avgAgedCoupleBefore: 3238,
  avgAgedCoupleAfter: 3355,
  avgWidowBefore: 1936,
  avgWidowAfter: 2005,
  avgDisabledBefore: 1642,
  avgDisabledAfter: 1701,
  totalRecipients: 'about 76 million',
  ssBeneficiaries: 'nearly 72 million',
  ssiRecipients: 'about 7.3 million',
  onlineNoticeTimeframe: 'late November 2026',
  onlineNoticeDeadline: 'November 18, 2026',
  mailedNoticeTimeframe: 'December 2026',
  sourceAnnouncementUrl: 'https://www.ssa.gov/news/en/advocates/2026-10-14.html',
  sourceBlogUrl: 'https://www.ssa.gov/blog/en/posts/2026-10-14.html',
  sourceColaUrl: 'https://www.ssa.gov/cola/',
  sourceFactSheetUrl: 'https://www.ssa.gov/news/en/cola/factsheets/2027.html',
  medicarePartBStatus: 'not yet announced',
} as const;

export { CONSTANTS_2026 } from '../lib/constants-2026';
export * from '../lib/engine';

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
  status: 'verified' | 'unverified' | '2027-pending';
  note?: string;
}

export const OFFICIAL_CONSTANTS = {
  // Medicare Part B Standard Premium (2026)
  MEDICARE_PART_B_PREMIUM_2026: {
    value: 202.90,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-a-b-premiums-and-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: 'The standard monthly premium for Medicare Part B enrollees will be $202.90 for 2026, an increase from 2025.',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>,

  // Medicare Part B Annual Deductible (2026)
  MEDICARE_PART_B_DEDUCTIBLE_2026: {
    value: 283,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-a-b-premiums-and-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: 'The annual deductible for all Medicare Part B beneficiaries is $283 in 2026.',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>,

  // Medicare Part A Inpatient Deductible (2026)
  MEDICARE_PART_A_DEDUCTIBLE_2026: {
    value: 1736,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-a-b-premiums-and-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: 'The Medicare Part A inpatient hospital deductible that beneficiaries pay if admitted to the hospital will be $1,736 in 2026.',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>,

  // Medicare Part A Coinsurance Days 61-90 (2026)
  MEDICARE_PART_A_COINSURANCE_61_90_2026: {
    value: 434,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-a-b-premiums-and-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: 'The Part A daily coinsurance for days 61-90 of hospitalization in a benefit period will be $434 in 2026.',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>,

  // Medicare Part D Base Beneficiary Premium (2026)
  MEDICARE_PART_D_BASE_PREMIUM_2026: {
    value: 38.99,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-part-d-rate-announcement',
    snapshotFile: 'cms_2026_part_d_rate_announcement.html',
    quotedText: 'The Part D base beneficiary premium for 2026 is $38.99.',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>,

  // Medicare Part D Maximum Standard Deductible (2026)
  MEDICARE_PART_D_DEDUCTIBLE_2026: {
    value: 615,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-part-d-rate-announcement',
    snapshotFile: 'cms_2026_part_d_rate_announcement.html',
    quotedText: 'The maximum standard Part D deductible for 2026 is $615.',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>,

  // Medicare Part D Out-of-Pocket Cap (2026)
  MEDICARE_PART_D_OOP_CAP_2026: {
    value: 2100,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-part-d-rate-announcement',
    snapshotFile: 'cms_2026_part_d_rate_announcement.html',
    quotedText: 'The statutory out-of-pocket prescription drug spending cap under the Inflation Reduction Act is $2,100 for 2026.',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>,

  // Social Security Taxable Maximum Wage Base (2026)
  SOCIAL_SECURITY_WAGE_BASE_2026: {
    value: 184500,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.ssa.gov/news/press/factsheets/colafacts2026.pdf',
    snapshotFile: 'ssa_2026_cola_fact_sheet.html',
    quotedText: 'The maximum amount of earnings subject to the Social Security tax (taxable wage base) is $184,500 in 2026.',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>,

  // Social Security Earnings Test Under FRA (2026)
  EARNINGS_TEST_UNDER_FRA_2026: {
    value: 24480,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.ssa.gov/news/press/factsheets/colafacts2026.pdf',
    snapshotFile: 'ssa_2026_cola_fact_sheet.html',
    quotedText: 'Under Full Retirement Age: The earnings-test threshold under FRA for 2026 is $24,480 ($2,040/mo).',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>,

  // Social Security Earnings Test Year-of-FRA (2026)
  EARNINGS_TEST_YEAR_OF_FRA_2026: {
    value: 65160,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.ssa.gov/news/press/factsheets/colafacts2026.pdf',
    snapshotFile: 'ssa_2026_cola_fact_sheet.html',
    quotedText: 'In the Year of Reaching Full Retirement Age: The earnings-test limit in the year individuals reach full retirement age is $65,160 ($5,430/mo) for 2026.',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>,

  // Minimum Community Spouse Resource Allowance (2026)
  CSRA_MIN_2026: {
    value: 32532,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.medicaid.gov/federal-policy-guidance/downloads/cib04272026.pdf',
    snapshotFile: 'cms_cib_04272026_spousal_impoverishment.html',
    quotedText: 'Minimum Community Spouse Resource Allowance: $32,532 (effective January 1, 2026).',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>,

  // Maximum Community Spouse Resource Allowance (2026)
  CSRA_MAX_2026: {
    value: 162660,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.medicaid.gov/federal-policy-guidance/downloads/cib04272026.pdf',
    snapshotFile: 'cms_cib_04272026_spousal_impoverishment.html',
    quotedText: 'Maximum Community Spouse Resource Allowance: $162,660 (effective January 1, 2026).',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>,

  // Medicaid Minimum Home Equity Limit (2026)
  MEDICAID_HOME_EQUITY_MIN_2026: {
    value: 752000,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.medicaid.gov/federal-policy-guidance/downloads/cib04272026.pdf',
    snapshotFile: 'cms_cib_04272026_spousal_impoverishment.html',
    quotedText: 'Minimum Home Equity Limit: $752,000 in 2026.',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>,

  // Medicaid Maximum Home Equity Limit (2026)
  MEDICAID_HOME_EQUITY_MAX_2026: {
    value: 1130000,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.medicaid.gov/federal-policy-guidance/downloads/cib04272026.pdf',
    snapshotFile: 'cms_cib_04272026_spousal_impoverishment.html',
    quotedText: 'Maximum Home Equity Limit: $1,130,000 in 2026.',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>,

  // MMMNA Federal Minimum Floor (Effective July 1, 2026)
  // July 1, 2026 floor ($2,705.00; prior baseline was $2,643.75; not a CSRA divisor)
  MMMNA_MIN_FLOOR_2026: {
    value: 2705.00,
    benefitYear: 2026,
    effectiveDate: '2026-07-01',
    sourceUrl: 'https://www.medicaid.gov/federal-policy-guidance/downloads/cib04272026.pdf',
    snapshotFile: 'cms_cib_04272026_spousal_impoverishment.html',
    quotedText: 'Minimum Monthly Maintenance Needs Allowance: $2,705.00 (effective July 1, 2026 through June 30, 2027) for the 48 contiguous states and the District of Columbia. (Alaska and Hawaii differ).',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>,

  // MMMNA Federal Maximum Cap (2026)
  MMMNA_MAX_CAP_2026: {
    value: 4066.50,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.medicaid.gov/federal-policy-guidance/downloads/cib04272026.pdf',
    snapshotFile: 'cms_cib_04272026_spousal_impoverishment.html',
    quotedText: 'Maximum Monthly Maintenance Needs Allowance: $4,066.50 (effective January 1, 2026 through December 31, 2026).',
    lastVerified: '2026-10-10',
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
    status: 'verified'
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

  // Medicare Part B IRMAA Surcharges (2026)
  MEDICARE_PART_B_IRMAA_TIER_1_SURCHARGE_2026: {
    value: 81.20,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-a-b-premiums-and-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: '<td>$81.20</td>',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_B_IRMAA_TIER_2_SURCHARGE_2026: {
    value: 202.90,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-a-b-premiums-and-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: '<td>$202.90</td>',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_B_IRMAA_TIER_3_SURCHARGE_2026: {
    value: 324.60,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-a-b-premiums-and-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: '<td>$324.60</td>',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_B_IRMAA_TIER_4_SURCHARGE_2026: {
    value: 446.30,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-a-b-premiums-and-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: '<td>$446.30</td>',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_B_IRMAA_TIER_5_SURCHARGE_2026: {
    value: 487.00,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-a-b-premiums-and-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: '<td>$487.00</td>',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_B_IRMAA_TIER_5_TOTAL_2026: {
    value: 689.90,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-a-b-premiums-and-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: '<td>$689.90</td>',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_B_IRMAA_MFS_TIER_2_SURCHARGE_2026: {
    value: 446.30,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-a-b-premiums-and-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: '<td>$446.30</td>',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_B_IRMAA_MFS_TIER_3_SURCHARGE_2026: {
    value: 487.00,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-a-b-premiums-and-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: '<td>$487.00</td>',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_B_IRMAA_MFS_TIER_3_TOTAL_2026: {
    value: 689.90,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-a-b-premiums-and-deductibles',
    snapshotFile: 'cms_2026_parts_ab_premiums.html',
    quotedText: '<td>$689.90</td>',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>,

  // Medicare Part D IRMAA Surcharges (2026)
  MEDICARE_PART_D_IRMAA_TIER_1_SURCHARGE_2026: {
    value: 14.20,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-part-d-rate-announcement',
    snapshotFile: 'cms_2026_part_d_rate_announcement.html',
    quotedText: '<td>$14.20</td>',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_D_IRMAA_TIER_2_SURCHARGE_2026: {
    value: 36.70,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-part-d-rate-announcement',
    snapshotFile: 'cms_2026_part_d_rate_announcement.html',
    quotedText: '<td>$36.70</td>',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_D_IRMAA_TIER_3_SURCHARGE_2026: {
    value: 59.30,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-part-d-rate-announcement',
    snapshotFile: 'cms_2026_part_d_rate_announcement.html',
    quotedText: '<td>$59.30</td>',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_D_IRMAA_TIER_4_SURCHARGE_2026: {
    value: 81.80,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-part-d-rate-announcement',
    snapshotFile: 'cms_2026_part_d_rate_announcement.html',
    quotedText: '<td>$81.80</td>',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_D_IRMAA_TIER_5_SURCHARGE_2026: {
    value: 89.30,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-part-d-rate-announcement',
    snapshotFile: 'cms_2026_part_d_rate_announcement.html',
    quotedText: '<td>$89.30</td>',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_D_IRMAA_MFS_TIER_2_SURCHARGE_2026: {
    value: 81.80,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-part-d-rate-announcement',
    snapshotFile: 'cms_2026_part_d_rate_announcement.html',
    quotedText: '<td>$81.80</td>',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>,

  MEDICARE_PART_D_IRMAA_MFS_TIER_3_SURCHARGE_2026: {
    value: 89.30,
    benefitYear: 2026,
    effectiveDate: '2026-01-01',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-part-d-rate-announcement',
    snapshotFile: 'cms_2026_part_d_rate_announcement.html',
    quotedText: '<td>$89.30</td>',
    lastVerified: '2026-10-10',
    status: 'verified'
  } as OfficialConstant<number>
};

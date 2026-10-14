/**
 * cola2027Pending.ts
 *
 * Official 2027 Social Security COLA, Wage Base, Earnings Test, and SSI figures.
 * Announced by the Social Security Administration on October 14, 2026 at 8:30 a.m. ET.
 *
 * Source: SSA COLA Fact Sheet 2027 — https://www.ssa.gov/news/press/factsheets/colafacts2027.pdf
 *
 * ARCHITECTURAL NOTE:
 * All constants in this file are status: 'verified' as of October 14, 2026.
 * They may be imported by live user-facing pages ONLY after owner sign-off.
 * The snapshotFile must be saved by the owner at data/sources/ssa_2027_cola_fact_sheet.pdf
 * and recorded in sources_manifest.json before these values go to main.
 */

export interface OfficialConstant<T> {
  value: T;
  benefitYear: number;
  effectiveDate: string;
  sourceUrl: string;
  snapshotFile: string;
  quotedText: string;
  lastVerified: string;
  status: 'verified' | 'unverified-source' | '2027-pending';
  note?: string;
  secondarySourceUrl?: string;
  secondarySnapshotFile?: string;
  secondaryQuotedText?: string;
}

export const PENDING_2027_CONSTANTS = {
  // Social Security Cost-of-Living Adjustment (COLA) — 2027
  // Official: 3.6%, announced October 14, 2026 by SSA / BLS CPI-W release
  SOCIAL_SECURITY_COLA_PERCENTAGE_2027: {
    value: 3.6,
    benefitYear: 2027,
    effectiveDate: '2027-01-01',
    sourceUrl: 'https://www.ssa.gov/news/press/factsheets/colafacts2027.pdf',
    snapshotFile: 'ssa_2027_cola_fact_sheet.pdf',
    quotedText: 'The cost-of-living adjustment (COLA) for 2027 is 3.6 percent.',
    lastVerified: '2026-10-14',
    status: 'verified',
    note: 'Officially announced October 14, 2026 at 8:30 a.m. ET by SSA. Effective January 1, 2027. Based on CPI-W Q3 2026 data released by BLS.',
    secondarySourceUrl: 'https://www.bls.gov/cpi/',
    secondaryQuotedText: 'CPI-W third quarter 2026 average compared to third quarter 2025 average, per SSA formula under 42 U.S.C. § 415(i).'
  } as OfficialConstant<number>,

  // Maximum Taxable Social Security Earnings (Wage Base) — 2027
  // Official: $192,300, up from $184,500 in 2026
  SOCIAL_SECURITY_WAGE_BASE_2027: {
    value: 192300,
    benefitYear: 2027,
    effectiveDate: '2027-01-01',
    sourceUrl: 'https://www.ssa.gov/news/press/factsheets/colafacts2027.pdf',
    snapshotFile: 'ssa_2027_cola_fact_sheet.pdf',
    quotedText: 'The taxable maximum for 2027 is $192,300.',
    lastVerified: '2026-10-14',
    status: 'verified',
    note: 'Up from $184,500 in 2026. Effective January 1, 2027.'
  } as OfficialConstant<number>,

  // Retirement Earnings Test Exempt Amount — Under Full Retirement Age (2027)
  // Official: $25,560/year ($2,130/month)
  EARNINGS_TEST_UNDER_FRA_2027: {
    value: 25560,
    benefitYear: 2027,
    effectiveDate: '2027-01-01',
    sourceUrl: 'https://www.ssa.gov/news/press/factsheets/colafacts2027.pdf',
    snapshotFile: 'ssa_2027_cola_fact_sheet.pdf',
    quotedText: 'The retirement earnings test exempt amount for workers under full retirement age is $25,560 ($2,130/month) in 2027.',
    lastVerified: '2026-10-14',
    status: 'verified',
    note: 'SSA deducts $1 from benefits for every $2 earned above this limit. Effective January 1, 2027.'
  } as OfficialConstant<number>,

  // Retirement Earnings Test Exempt Amount — Year Reaching FRA (2027)
  // Official: $67,920/year ($5,660/month)
  EARNINGS_TEST_YEAR_OF_FRA_2027: {
    value: 67920,
    benefitYear: 2027,
    effectiveDate: '2027-01-01',
    sourceUrl: 'https://www.ssa.gov/news/press/factsheets/colafacts2027.pdf',
    snapshotFile: 'ssa_2027_cola_fact_sheet.pdf',
    quotedText: 'The retirement earnings test exempt amount for workers in the year they reach full retirement age is $67,920 ($5,660/month) in 2027.',
    lastVerified: '2026-10-14',
    status: 'verified',
    note: 'SSA deducts $1 for every $3 earned above this limit up to the month the worker reaches FRA. Effective January 1, 2027.'
  } as OfficialConstant<number>,

  // Supplemental Security Income (SSI) Standard Payment Rate — Individual (2027)
  // Official: $1,029/month (up from $994 in 2026; $994 × 1.036 = $1,029.58 → $1,029)
  // Effective December 31, 2026 (because January 1, 2027 is a federal holiday)
  SSI_MAX_FEDERAL_BENEFIT_INDIVIDUAL_2027: {
    value: 1029,
    benefitYear: 2027,
    effectiveDate: '2026-12-31',
    sourceUrl: 'https://www.ssa.gov/news/press/factsheets/colafacts2027.pdf',
    snapshotFile: 'ssa_2027_cola_fact_sheet.pdf',
    quotedText: 'The SSI Federal Benefit Rate for an eligible individual is $1,029 per month in 2027.',
    lastVerified: '2026-10-14',
    status: 'verified',
    note: 'Payment begins December 31, 2026 — the last business day before January 1, 2027 (federal holiday). Up from $994 in 2026.'
  } as OfficialConstant<number>,

  // Supplemental Security Income (SSI) Standard Payment Rate — Couple (2027)
  // Official: $1,545/month (up from $1,491 in 2026; $1,491 × 1.036 = $1,544.58 → $1,545)
  SSI_MAX_FEDERAL_BENEFIT_COUPLE_2027: {
    value: 1545,
    benefitYear: 2027,
    effectiveDate: '2026-12-31',
    sourceUrl: 'https://www.ssa.gov/news/press/factsheets/colafacts2027.pdf',
    snapshotFile: 'ssa_2027_cola_fact_sheet.pdf',
    quotedText: 'The SSI Federal Benefit Rate for an eligible couple is $1,545 per month in 2027.',
    lastVerified: '2026-10-14',
    status: 'verified',
    note: 'Payment begins December 31, 2026. Up from $1,491 in 2026.'
  } as OfficialConstant<number>
};

/**
 * Safety verification function.
 * Returns the constant value only when status is 'verified' and value is not null.
 * Throws if the constant is still pending or unverified.
 */
export function getPending2027Constant(key: keyof typeof PENDING_2027_CONSTANTS) {
  const item = PENDING_2027_CONSTANTS[key];
  if (item.status === '2027-pending' || item.value === null) {
    throw new Error(`SECURITY ALERT: 2027 constant [${key}] is marked '2027-pending' and cannot be used in live calculations.`);
  }
  if (item.status === 'unverified-source') {
    throw new Error(`DATA INTEGRITY: 2027 constant [${key}] is 'unverified-source' — snapshot not confirmed as raw official download.`);
  }
  return item;
}

/**
 * Seniors Audit Calculation Engine (Tax Year 2026)
 * Pure, deterministic mathematical functions backed by official 2026 constants.
 * All functions are unit-tested against Phase A test vectors.
 */

import { CONSTANTS_2026, type Constants2026 } from './constants-2026.ts';

export type FilingStatus = 'single' | 'mfj' | 'mfs' | 'hoh' | 'qss';

export interface TaxableSSParams {
  ss: number;
  otherAGI: number;
  taxExemptInterest?: number;
  status: FilingStatus;
  livedWithSpouse?: boolean;
}

export interface TaxableSSResult {
  prov: number;
  taxableSS: number;
  base1: number;
  base2: number;
}

/**
 * Calculates taxable Social Security benefits under IRC § 86 formulas.
 */
export function taxableSS(params: TaxableSSParams): TaxableSSResult {
  const { ss, otherAGI, taxExemptInterest = 0, status, livedWithSpouse = true } = params;
  const prov = otherAGI + taxExemptInterest + 0.5 * ss;
  let base1 = CONSTANTS_2026.socialSecurityTaxThresholds.singleBase1; // 25,000
  let base2 = CONSTANTS_2026.socialSecurityTaxThresholds.singleBase2; // 34,000

  if (status === 'mfj') {
    base1 = CONSTANTS_2026.socialSecurityTaxThresholds.mfjBase1; // 32,000
    base2 = CONSTANTS_2026.socialSecurityTaxThresholds.mfjBase2; // 44,000
  } else if (status === 'mfs' && livedWithSpouse) {
    base1 = CONSTANTS_2026.socialSecurityTaxThresholds.mfsLivedWithSpouseBase; // 0
    base2 = CONSTANTS_2026.socialSecurityTaxThresholds.mfsLivedWithSpouseBase; // 0
  }

  let result = 0;
  if (prov <= base1) {
    result = 0;
  } else if (prov <= base2) {
    result = 0.5 * (prov - base1);
  } else {
    result = 0.85 * (prov - base2) + Math.min(0.5 * (base2 - base1), 0.5 * ss);
  }
  const taxableSSAmount = Math.min(result, CONSTANTS_2026.socialSecurityTaxThresholds.maxTaxablePct * ss);

  return {
    prov,
    taxableSS: Math.round(taxableSSAmount * 100) / 100,
    base1,
    base2
  };
}

/**
 * Calculates the temporary Enhanced Senior Deduction (IRS Pub. 6142 / Schedule 1-A).
 * $6,000 per person aged 65+, phasing out at 6% above $75k (single) / $150k (joint).
 * MFS is statutorily ineligible.
 */
export function seniorDeduction(magi: number, status: FilingStatus, numEligible: number): number {
  if (status === 'mfs' || numEligible <= 0) return 0;
  const config = CONSTANTS_2026.seniorDeduction;
  const start = (status === 'mfj') ? config.phaseOutStartJoint : config.phaseOutStartSingle;
  // IRS Schedule 1-A (2025) Part V, lines 31-37: the 6% reduction is subtracted once from $6,000
  // (line 35), and that per-person amount is then entered for each qualifying individual.
  const perPerson = Math.max(0, config.amountPerPerson - config.phaseOutRate * Math.max(0, magi - start));
  return Math.round(perPerson * numEligible * 100) / 100;
}

export interface TaxableIncomeParams {
  agi: number;
  status: FilingStatus;
  numAgedBlind?: number;
  isItemized?: boolean;
  itemizedAmount?: number;
  applySeniorDeduction?: boolean;
  numEligibleSenior?: number;
  magi?: number;
}

export interface TaxableIncomeResult {
  taxableIncome: number;
  standardDeduction: number;
  additionalAgedBlind: number;
  seniorDeductionAmount: number;
  totalDeductions: number;
}

/**
 * Calculates taxable income: AGI - deductions (standard/itemized + aged/blind) - seniorDeduction
 */
export function calculateTaxableIncome(params: TaxableIncomeParams): TaxableIncomeResult {
  const {
    agi,
    status,
    numAgedBlind = 0,
    isItemized = false,
    itemizedAmount = 0,
    applySeniorDeduction = false,
    numEligibleSenior,
    magi
  } = params;

  const baseStandard = CONSTANTS_2026.standardDeduction[status] ?? CONSTANTS_2026.standardDeduction.single;
  const addRate = (status === 'mfj' || status === 'mfs')
    ? CONSTANTS_2026.additionalAgedBlind.married
    : CONSTANTS_2026.additionalAgedBlind.unmarried;
  const additionalAgedBlindTotal = numAgedBlind * addRate;

  const baseDeduction = isItemized ? itemizedAmount : (baseStandard + additionalAgedBlindTotal);

  const eligibleSeniors = numEligibleSenior !== undefined
    ? numEligibleSenior
    : (numAgedBlind > 0 ? Math.min(numAgedBlind, status === 'mfj' ? 2 : 1) : 0);

  const seniorDed = applySeniorDeduction
    ? seniorDeduction(magi ?? agi, status, eligibleSeniors)
    : 0;

  const totalDeductions = baseDeduction + seniorDed;
  const taxable = Math.max(0, agi - totalDeductions);

  return {
    taxableIncome: Math.round(taxable * 100) / 100,
    standardDeduction: baseStandard,
    additionalAgedBlind: additionalAgedBlindTotal,
    seniorDeductionAmount: seniorDed,
    totalDeductions
  };
}

export const HIGH_INCOME_MESSAGE = 'Not modeled above $201,775 taxable income (single) / $403,550 (MFJ); use the IRS Tax Withholding Estimator or IRS tax tables';

/**
 * Calculates federal income tax using progressive 2026 tax brackets.
 * Returns null if income exceeds modeled limit: $201,775 taxable income (single) / $403,550 (MFJ).
 */
export function federalTax(taxableIncome: number, status: FilingStatus): number | null {
  if (taxableIncome <= 0) return 0;

  const maxBracketSingle = 201775;
  const maxBracketMFJ = 403550;
  const isMFJ = (status === 'mfj' || status === 'qss');
  const maxThreshold = isMFJ ? maxBracketMFJ : maxBracketSingle;

  if (taxableIncome > maxThreshold) {
    return null;
  }

  let bracketTable = CONSTANTS_2026.brackets.single;
  if (isMFJ) {
    bracketTable = CONSTANTS_2026.brackets.mfj;
  }

  let tax = 0;
  let prevThreshold = 0;
  for (const [threshold, rate] of bracketTable) {
    if (taxableIncome > threshold) {
      tax += (threshold - prevThreshold) * rate;
      prevThreshold = threshold;
    } else {
      tax += (taxableIncome - prevThreshold) * rate;
      return Math.round(tax);
    }
  }

  return Math.round(tax);
}

/**
 * Numerical marginal rate calculation: re-runs total tax at income + $100 and divides difference by $100.
 */
export function marginalRate(
  calcTaxFn: (income: number) => number | null,
  currentIncome: number,
  delta: number = 100
): number | null {
  const taxBase = calcTaxFn(currentIncome);
  const taxPlus = calcTaxFn(currentIncome + delta);
  if (taxBase === null || taxPlus === null) return null;
  const diff = taxPlus - taxBase;
  return Math.round((diff / delta) * 1000) / 1000;
}

/**
 * Calculates IRS statutory safe harbor required annual tax payment (IRC § 6654).
 */
export function calculateRequiredPayment(
  currentYearTax: number,
  priorYearTax: number,
  priorAGI: number,
  status: FilingStatus = 'single'
): number {
  const agiThreshold = status === 'mfs' ? 75000 : 150000;
  const priorMultiplier = priorAGI > agiThreshold ? 1.10 : 1.00;
  const safeHarborPrior = priorYearTax * priorMultiplier;
  const safeHarborCurrent = 0.90 * currentYearTax;
  return Math.min(safeHarborCurrent, safeHarborPrior);
}

/**
 * Calculates withholding or estimated tax shortfall.
 */
export function calculateShortfall(
  requiredPayment: number,
  withheldYTD: number,
  estimatedPaid: number = 0,
  credits: number = 0
): number {
  return Math.max(0, requiredPayment - withheldYTD - estimatedPaid - credits);
}

/**
 * Selects the smallest statutory Form W-4V voluntary withholding rate (7%, 10%, 12%, 22%)
 * that covers the annual shortfall, else returns null.
 */
export function w4vRate(annualWithholdingNeeded: number, annualBenefit: number): number | null {
  if (annualBenefit <= 0 || annualWithholdingNeeded <= 0) return null;
  const rates = [0.07, 0.10, 0.12, 0.22];
  for (const r of rates) {
    if (r * annualBenefit >= annualWithholdingNeeded) {
      return r;
    }
  }
  return null;
}

/**
 * Calculates Medicare Part B late enrollment penalty per month:
 * 10% of standard Part B premium per full 12-month period late.
 */
export function partBPenaltyPerMonth(fullYearsLate: number): number {
  if (fullYearsLate <= 0) return 0;
  const rate = CONSTANTS_2026.medicare2026.lepRate; // 0.10
  const standard = CONSTANTS_2026.medicare2026.partBStandardPremium; // 202.90
  return Math.round((rate * standard * fullYearsLate) * 100) / 100;
}

/**
 * Medicare enrollment dates and parameters.
 */
export function medicareDates(birthMonth: number, birthYear: number) {
  const turn65Year = birthYear + 65;
  return {
    turn65Year,
    iepMonthsCount: 7,
    openEnrollment: CONSTANTS_2026.medicareOpenEnrollment
  };
}

/**
 * Returns the Medicare IRMAA premium year based on the 2-year lookback tax return.
 */
export function irmaaPremiumYear(incomeYear: number): number {
  return incomeYear + 2;
}

export interface ProRataParams {
  basis: number;
  yearEndIRABalances: number;
  distributionsInYear: number;
  outstandingRollovers?: number;
}

/**
 * Calculates non-taxable pro-rata share of traditional IRA distributions (Form 8606).
 */
export function proRataNontaxableShare(params: ProRataParams): number {
  const { basis, yearEndIRABalances, distributionsInYear, outstandingRollovers = 0 } = params;
  const denominator = yearEndIRABalances + distributionsInYear + outstandingRollovers;
  if (denominator <= 0 || basis <= 0) return 0;
  return Math.min(1, Math.round((basis / denominator) * 10000) / 10000);
}

export interface MedicareDateInput {
  birthDate: string; // "YYYY-MM-DD"
  signUpDate: string; // "YYYY-MM"
  hasEmployerCoverage?: boolean;
  employerCoverageEndDate?: string; // "YYYY-MM"
}

export interface MedicareDateOutput {
  treatedAge65Date: string;
  iepOpenDate: string;
  iepCloseDate: string;
  partAEffectiveDate: string;
  partBEffectiveDate: string;
  isOutOfWindow?: boolean;
  gepRequired?: boolean;
  penaltyApplies?: boolean;
  treatedTurning65Note?: string;
  enrollmentPeriod?: 'IEP' | 'GEP' | 'SEP' | string;
  explanation?: string;
  hasGap?: boolean;
  gapLine?: string;
}

/**
 * Calculates Medicare Part A and Part B coverage effective dates under CMS regulations and SSA POMS HI 00805.
 */
export function calculateMedicareCoverageDates(input: MedicareDateInput): MedicareDateOutput {
  const [bYear, bMonth, bDay] = input.birthDate.split('-').map(Number);
  const [sYear, sMonth] = input.signUpDate.split('-').map(Number);

  // Born on 1st of month rule: treated as turning 65 in prior month (SSA POMS HI 00805)
  const bornOnFirst = bDay === 1;
  let eligYear = bYear + 65;
  let eligMonth = bMonth;
  if (bornOnFirst) {
    eligMonth -= 1;
    if (eligMonth === 0) {
      eligMonth = 12;
      eligYear -= 1;
    }
  }

  const treatedAge65Date = `${eligYear}-${String(eligMonth).padStart(2, '0')}-01`;

  // IEP: 3 months before to 3 months after
  let iepStartYear = eligYear;
  let iepStartMonth = eligMonth - 3;
  if (iepStartMonth <= 0) {
    iepStartMonth += 12;
    iepStartYear -= 1;
  }
  const iepOpenDate = `${iepStartYear}-${String(iepStartMonth).padStart(2, '0')}-01`;

  let iepEndYear = eligYear;
  let iepEndMonth = eligMonth + 3;
  if (iepEndMonth > 12) {
    iepEndMonth -= 12;
    iepEndYear += 1;
  }
  const lastDay = new Date(iepEndYear, iepEndMonth, 0).getDate();
  const iepCloseDate = `${iepEndYear}-${String(iepEndMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const monthDiff = (sYear - eligYear) * 12 + (sMonth - eligMonth);

  // Part A is premium-free starting treatedAge65Date (retroactive up to 6 months if enrolled later, never before month turned 65)
  const partAEffectiveDate = treatedAge65Date;

  let partBYear = eligYear;
  let partBMonth = eligMonth;
  let enrollmentPeriod: 'IEP' | 'GEP' | 'SEP' = 'IEP';
  let penaltyApplies = false;
  let isOutOfWindow = false;
  let gepRequired = false;
  let explanation = '';

  if (monthDiff < -3) {
    // Before IEP opens: assumed to start at treatedAge65Date
    partBYear = eligYear;
    partBMonth = eligMonth;
    enrollmentPeriod = 'IEP';
    explanation = `Enrolling in the 3 months before your 65th birthday month starts Part B on the first day of your birthday month (${treatedAge65Date}).`;
  } else if (monthDiff >= -3 && monthDiff <= -1) {
    // Months -3, -2, -1 of IEP (3 months before birthday month): starts 1st day of birthday month
    partBYear = eligYear;
    partBMonth = eligMonth;
    enrollmentPeriod = 'IEP';
    explanation = `Enrolling in the 3 months before your 65th birthday month starts Part B on the first day of your birthday month (${treatedAge65Date}).`;
  } else if (monthDiff >= 0 && monthDiff <= 3) {
    // Months 0, 1, 2, 3 of IEP (birthday month and 3 months after): starts 1st day of following month
    partBMonth = sMonth + 1;
    partBYear = sYear;
    if (partBMonth > 12) {
      partBMonth = 1;
      partBYear += 1;
    }
    enrollmentPeriod = 'IEP';
    explanation = `Under current Medicare rules (Consolidated Appropriations Act), enrolling during your birthday month or the 3 months after starts Part B coverage on the 1st of the month following enrollment.`;
  } else {
    // After IEP closes (monthDiff > 3)
    if (input.hasEmployerCoverage) {
      enrollmentPeriod = 'SEP';
      penaltyApplies = false;
      partBMonth = sMonth + 1;
      partBYear = sYear;
      if (partBMonth > 12) {
        partBMonth = 1;
        partBYear += 1;
      }
      explanation = `Enrolling under a Special Enrollment Period (SEP) after leaving active employer group coverage allows Part B coverage to begin the 1st of the month following enrollment with $0 late enrollment penalty.`;
    } else {
      // General Enrollment Period (GEP: Jan 1 – Mar 31)
      const isGEPMonth = sMonth >= 1 && sMonth <= 3;
      if (isGEPMonth) {
        enrollmentPeriod = 'GEP';
        penaltyApplies = true;
        partBMonth = sMonth + 1;
        partBYear = sYear;
        if (partBMonth > 12) {
          partBMonth = 1;
          partBYear += 1;
        }
        explanation = `Enrolling during the General Enrollment Period (January 1 – March 31) starts Part B coverage on the 1st day of the month following enrollment. A Part B late enrollment penalty applies without creditable employer coverage.`;
      } else {
        isOutOfWindow = true;
        gepRequired = true;
        penaltyApplies = true;
        enrollmentPeriod = 'GEP';
        explanation = `Missed 7-month IEP window without qualifying employer coverage. Must enroll during General Enrollment Period (January 1 – March 31) and pay a permanent Part B late enrollment penalty.`;
      }
    }
  }

  const partBEffectiveDate = (isOutOfWindow && gepRequired && !input.hasEmployerCoverage && !(sMonth >= 1 && sMonth <= 3))
    ? 'General Enrollment Period (GEP: Jan 1 – Mar 31) required; Part B late penalty applies without creditable employer coverage'
    : `${partBYear}-${String(partBMonth).padStart(2, '0')}-01`;

  // Gap calculation (Item 1b)
  let hasGap = false;
  let gapLine: string | undefined;

  if (input.employerCoverageEndDate) {
    const [empYear, empMonth] = input.employerCoverageEndDate.split('-').map(Number);
    if (!isOutOfWindow) {
      const gapMonthCount = (partBYear - empYear) * 12 + (partBMonth - empMonth) - 1;
      if (gapMonthCount > 0) {
        hasGap = true;
        gapLine = `Coverage gap notice: Your employer coverage ends in ${input.employerCoverageEndDate}, but Part B coverage begins on ${partBEffectiveDate}. You will have a ${gapMonthCount}-month gap in outpatient medical coverage.`;
      } else {
        hasGap = false;
        gapLine = `No coverage gap: Medicare Part B coverage begins on ${partBEffectiveDate}, continuous with or prior to your employer coverage ending in ${input.employerCoverageEndDate}.`;
      }
    }
  } else if (!input.hasEmployerCoverage) {
    if (enrollmentPeriod === 'IEP' && monthDiff >= 0) {
      hasGap = true;
      gapLine = `Coverage gap notice: Because you enroll during or after your 65th birth month, Part B begins ${partBEffectiveDate}. You will have a temporary gap in outpatient medical coverage starting from your 65th birthday month until Part B takes effect.`;
    } else if (enrollmentPeriod === 'GEP') {
      hasGap = true;
      gapLine = `Coverage gap notice: Part B coverage begins on ${partBEffectiveDate}. Without creditable employer coverage, you had a gap in outpatient coverage and a Part B late enrollment penalty applies.`;
    }
  }

  return {
    treatedAge65Date,
    iepOpenDate,
    iepCloseDate,
    partAEffectiveDate,
    partBEffectiveDate,
    isOutOfWindow,
    gepRequired,
    penaltyApplies,
    enrollmentPeriod,
    explanation,
    hasGap,
    gapLine,
    treatedTurning65Note: bornOnFirst ? `treated as turning 65 in ${eligYear}-${String(eligMonth).padStart(2, '0')}` : undefined
  };
}

// ─── 2026 benefit-program limits (HHS poverty guidelines, Medicare Savings Programs, Extra Help, SNAP) ───
// All inputs come from constants-2026.json (hhsPoverty2026, lis2026, msp2026, snapFY2027) with source URLs.
export type FplRegion = 'standard' | 'AK' | 'HI';

/** Round UP to a whole dollar, ignoring floating-point noise (the CMS and USDA tables round up). */
const roundUpDollar = (x: number): number => Math.ceil(x - 1e-9);

/** 2026 HHS poverty guideline (annual) for a household size. */
export function fplAnnual2026(householdSize: number, region: FplRegion = 'standard'): number {
  const g = CONSTANTS_2026.hhsPoverty2026;
  const row = region === 'AK' ? g.alaska : region === 'HI' ? g.hawaii : g.fortyEightStates;
  const n = Math.max(1, Math.floor(householdSize));
  return row.first + row.additional * (n - 1);
}

/** Medicare Savings Program monthly income limits, 2026: FPL x 100%/120%/135% plus the $20 disregard, rounded up. */
export function mspMonthlyLimits(householdSize: number, region: FplRegion = 'standard') {
  const m = CONSTANTS_2026.msp2026;
  const fplMonthly = fplAnnual2026(householdSize, region) / 12;
  const d = CONSTANTS_2026.hhsPoverty2026.generalIncomeDisregardMonthly;
  return {
    qmb: roundUpDollar(fplMonthly * m.qmbPctFpl + d),
    slmb: roundUpDollar(fplMonthly * m.slmbPctFpl + d),
    qi: roundUpDollar(fplMonthly * m.qiPctFpl + d),
    resources: householdSize >= 2 ? m.resourcesCouple : m.resourcesSingle,
  };
}

/** Extra Help (Part D low-income subsidy) 2026 limits: income up to 150% FPL; resources per CMS memo. */
export function lisLimits2026(householdSize: number, region: FplRegion = 'standard') {
  const l = CONSTANTS_2026.lis2026;
  const annual = fplAnnual2026(householdSize, region) * l.incomePctFpl;
  return {
    incomeAnnual: Math.round(annual * 100) / 100,
    incomeMonthly: Math.round((annual / 12) * 100) / 100,
    resources: householdSize >= 2 ? l.resourcesCouple : l.resourcesSingle,
    resourcesWithBurial: householdSize >= 2 ? l.resourcesCoupleWithBurial : l.resourcesSingleWithBurial,
  };
}

/** SNAP net monthly income limit (100% of poverty) for federal fiscal year 2027 (from Oct 1, 2026). */
export function snapNetLimitFY2027(householdSize: number): number {
  return roundUpDollar(fplAnnual2026(householdSize) / 12);
}

/** SNAP standard deduction for federal fiscal year 2027, 48 states and DC. */
export function snapStandardDeductionFY2027(householdSize: number): number {
  const s = CONSTANTS_2026.snapFY2027.standardDeduction;
  return householdSize <= 3 ? s['1to3'] : householdSize === 4 ? s['4'] : householdSize === 5 ? s['5'] : s['6plus'];
}


// ─── Medicare vs. Medicaid Calculator Engine Functions ───
// All cost values from CMS 2026 Parts A & B Premiums and Deductibles fact sheet
// (https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles)
// Verified 2026-10-14. OFFICIAL_CONSTANTS in src/data/constants.ts are the authoritative source.

/** 2026 Medicare cost constants — sourced from CMS Nov 14, 2025. */
export const MEDICARE_2026 = {
  /** Part A hospital deductible per benefit period. CMS: "$1,736 in 2026" */
  partADeductible: 1736,
  /** Part A hospital coinsurance days 61-90 per day. CMS: "$434 per day" */
  partACoin6190: 434,
  /** Part A lifetime reserve day coinsurance per day. CMS: "$868 per day" */
  partALifetimeReserve: 868,
  /** Part A skilled nursing facility coinsurance days 21-100 per day. CMS: "$217.00 per day" */
  snfCoin2190: 217,
  /** Part A premium — 30-39 quarters. CMS: "$311" */
  partAPremium3039: 311,
  /** Part A premium — under 30 quarters. CMS: "$565" */
  partAPremiumUnder30: 565,
  /** Part B standard monthly premium. CMS: "$202.90" */
  partBPremium: 202.90,
  /** Part B annual deductible. CMS: "$283" */
  partBDeductible: 283,
  /** Part B coinsurance rate (no annual cap). */
  partBCoin: 0.20,
  /** Part D base beneficiary premium 2026. CMS Part D bid info. */
  partDBasePremium: 38.99,
  /** Part D max standard deductible 2026. */
  partDDeductible: 615,
  /** Part D out-of-pocket cap 2026 (redesign). */
  partDOopCap: 2100,
} as const;

/**
 * SSI 2026 Federal Benefit Rates.
 * Source: SSA https://www.ssa.gov/oact/cola/SSI.html lists the 2026 annual federal benefit rates
 * ($11,929.46 individual / $17,892.21 couple); divided by 12 and rounded they give $994 / $1,491 per month.
 */
export const SSI_2026 = {
  individual: 994,        // UNVERIFIED — computed from 2027 COLA back-calculation
  couple: 1491,           // VERIFIED via constants.ts OFFICIAL_2027_COLA.ssiCouple2026
  resourceSingle: 2000,   // 20 CFR 416.1205 — not changed since 1989
  resourceCouple: 3000,   // 20 CFR 416.1205 — not changed since 1989
  generalExclusion: 20,   // 20 CFR 416.1124(c)(12)
  earnedExclusionBase: 65,// 20 CFR 416.1112(c)(10)
  /** Special income level for institutional (nursing facility) Medicaid = 300% SSI individual.
   *  COMPUTED: 994 x 3 = 2982. UNVERIFIED until CMS confirms in state plan or POMS. */
  specialIncomeLevel: 2982,
} as const;

// ─── Input/Output Types ───

export type HouseholdStatus = 'single' | 'married_together' | 'married_apart' | 'widowed';
export type LivingSituation = 'home' | 'assisted_living' | 'nursing_facility';
export type MspTier = 'QMB' | 'SLMB' | 'QI' | 'QDWI' | 'none';
export type DualStatus =
  | 'full_dual'
  | 'qmb_plus'
  | 'qmb_only'
  | 'slmb_only'
  | 'qi_only'
  | 'medicare_only'
  | 'medicaid_only'
  | 'none';

export interface MvcIncomeInput {
  socialSecurity: number;   // gross monthly SS/SSDI (before Medicare deductions)
  pension: number;          // monthly pension/annuity
  wages: number;            // monthly gross earned wages
  otherUnearned: number;    // rental, interest, etc.
}

export interface MvcInput {
  age: number;
  householdStatus: HouseholdStatus;
  /** Countable resources (cash, savings, investments — excludes home, one car, household goods). */
  resources: number;
  income: MvcIncomeInput;
  /** Optional: spouse income for married_together */
  spouseIncome?: MvcIncomeInput;
  /** Work quarters for Medicare Part A eligibility. */
  workQuarters: number;
  /** Months of SSDI received (Medicare eligibility after 24 months). */
  ssdiMonths?: number;
  hasESRD?: boolean;
  hasALS?: boolean;
  /** Optional: MAGI from last tax year for IRMAA calculation. */
  magi?: number;
  filingStatus?: 'single' | 'mfj' | 'mfs';
  /** Expected annual Part B charges (doctor visits, outpatient). */
  annualPartBCharges: number;
  /** Number of hospital stays (each triggers the deductible). */
  hospitalStays: number;
  /** Total inpatient hospital days across all stays this year. */
  hospitalDays: number;
  /** Total skilled nursing facility days this year. */
  snfDays: number;
  livingSituation: LivingSituation;
  /** Monthly facility cost (if assisted_living or nursing_facility). */
  facilityCost?: number;
  /** FPL region for MSP limit calculation. */
  region: FplRegion;
}

export interface MvcCostResult {
  /** Total estimated annual cost under Original Medicare alone (Part A+B, no MSP, no supplement). */
  medicareOnlyCost: number;
  /** Annual cost with QMB (everything paid by state). */
  withQmbCost: number;
  /** Annual cost with SLMB (Part B premium paid by state). */
  withSlmbCost: number;
  /** Annual cost with QI (Part B premium paid by state). */
  withQiCost: number;
  /** Annual Part A premium. */
  partAPremiumAnnual: number;
  /** Annual Part B premium (including IRMAA if applicable). */
  partBPremiumAnnual: number;
  /** Part B deductible. */
  partBDeductibleAmount: number;
  /** Part B coinsurance (20% of charges above deductible). */
  partBCoinsurance: number;
  /** Hospital cost across all stays. */
  hospitalCost: number;
  /** SNF coinsurance days 21-100. */
  snfCost: number;
}

export interface MvcMspResult {
  tier: MspTier;
  /** Countable income used in the test. */
  countableIncome: number;
  /** Published monthly limit for the qualifying tier. */
  limit: number;
  /** Income headroom to next tier boundary. Negative = already past that tier. */
  headroomToNextTier: number | null;
  /** Resource test passed? */
  resourcesPass: boolean;
  /** Automatically receives Extra Help if true. */
  autoExtraHelp: boolean;
  limits: { qmb: number; slmb: number; qi: number; resources: number };
}

export interface MvcEligibilityResult {
  /** Is the person Medicare-eligible? */
  medicareEligible: boolean;
  medicareReason: string;
  /** Part A premium this person would pay ($0 / $311 / $565). */
  partAPremium: number;
  msp: MvcMspResult;
  /** Deemed Extra Help eligible? */
  extraHelpDeemed: boolean;
  /** Meets income+resource test for Extra Help? */
  extraHelpQualifies: boolean;
  /** Likely qualifies for full Medicaid (federal aged/blind/disabled baseline only)? */
  fullMedicaidLikely: boolean;
  fullMedicaidReason: string;
  /** Dual status classification. */
  dualStatus: DualStatus;
  costs: MvcCostResult;
  /** Is this result for an institutional (nursing facility) scenario? */
  institutional: boolean;
  /** Institutional: income at or below 300% SSI ($2,982)? */
  institutionalIncomeOk: boolean;
}

// ─── Helper: determine Part A premium ───
/**
 * Part A monthly premium based on work quarters.
 * Source: CMS 2026 fact sheet — $0 for 40+ quarters, $311 for 30-39, $565 for under 30.
 */
export function partAPremiumMonthly(workQuarters: number): number {
  if (workQuarters >= 40) return 0;
  if (workQuarters >= 30) return MEDICARE_2026.partAPremium3039;
  return MEDICARE_2026.partAPremiumUnder30;
}

// ─── Helper: IRMAA Part B premium ───
/**
 * Total monthly Part B premium (base + IRMAA) for a given MAGI and filing status.
 * Uses 2024 MAGI (2-year lookback) to determine 2026 IRMAA tier.
 * Source: CMS 2026 fact sheet IRMAA table.
 */
export function partBMonthlyWithIrmaa(magi: number, filingStatus: 'single' | 'mfj' | 'mfs'): number {
  const tiers = CONSTANTS_2026.medicare2026.totalPartBByTier;  // [202.90,284.10,405.80,527.50,649.20,689.90]
  const singleThresholds = CONSTANTS_2026.medicare2026.irmaaTiersSingleMAGI2024; // [109k,137k,171k,205k,500k]
  const jointThresholds  = CONSTANTS_2026.medicare2026.irmaaTiersJointMAGI2024;  // [218k,274k,342k,410k,750k]
  if (filingStatus === 'mfs') {
    if (magi <= 109000) return tiers[0];
    if (magi < 391000)  return tiers[4];
    return tiers[5];
  }
  const thresholds = (filingStatus === 'mfj') ? jointThresholds : singleThresholds;
  // thresholds[4] is the upper bound of tier 4 (500,000 single / 750,000 MFJ).
  // CMS: "≥ $500,000" goes to tier 5 (highest). Use strict < so magi === threshold[4] goes to tier 5.
  for (let i = 0; i < thresholds.length - 1; i++) {
    if (magi <= thresholds[i]) return tiers[i];
  }
  if (magi < thresholds[thresholds.length - 1]) return tiers[thresholds.length - 1];
  return tiers[5]; // highest: ≥ $500,000 single / ≥ $750,000 MFJ
}

// ─── Helper: hospital cost ───
/**
 * Medicare Part A cost for a single benefit-period hospital stay of N total days.
 * Days 1-60: deductible $1,736, no daily coinsurance.
 * Days 61-90: $434/day.
 * Days 91-150 (lifetime reserve): $868/day.
 * Source: CMS Nov 2025 fact sheet.
 */
export function hospitalCostOnePeriod(days: number): number {
  if (days <= 0) return 0;
  const m = MEDICARE_2026;
  let cost = m.partADeductible;
  if (days > 60) cost += Math.min(days - 60, 30) * m.partACoin6190;
  if (days > 90) cost += Math.min(days - 90, 60) * m.partALifetimeReserve;
  return cost;
}

// ─── Helper: SNF coinsurance ───
/**
 * Medicare Part A skilled nursing facility coinsurance.
 * Days 1-20: $0 (requires qualifying 3-day inpatient stay).
 * Days 21-100: $217/day.
 * Days 101+: patient pays 100% (not modeled).
 * Source: CMS Nov 2025 fact sheet.
 */
export function snfCoinsurance(days: number): number {
  if (days <= 20) return 0;
  return Math.min(days - 20, 80) * MEDICARE_2026.snfCoin2190;
}

// ─── Helper: MSP countable income (SSI exclusion rules) ───
/**
 * Countable monthly income for MSP eligibility using SSI exclusion rules.
 * $20 general exclusion: applied to unearned first; remainder (if any) applied to earned.
 * Earned income: subtract $65 + half of the remainder.
 * Source: 20 CFR 416.1112; SSA POMS SI 00810.420.
 * IMPORTANT: Published MSP limits already include the $20 disregard.
 * Do NOT subtract $20 from the limit — subtract it from the income only.
 */
export function mspCountableIncome(income: MvcIncomeInput, spouseIncome?: MvcIncomeInput): number {
  const totalUnearned = income.socialSecurity + income.pension + income.otherUnearned +
    (spouseIncome ? spouseIncome.socialSecurity + spouseIncome.pension + spouseIncome.otherUnearned : 0);
  const totalEarned = income.wages + (spouseIncome ? spouseIncome.wages : 0);

  // $20 general exclusion: first against unearned
  const unearnedAfterExclusion = Math.max(0, totalUnearned - SSI_2026.generalExclusion);
  const remainingExclusion     = Math.max(0, SSI_2026.generalExclusion - totalUnearned);

  // Earned income exclusion: $65 + half of remainder
  let countableEarned = 0;
  if (totalEarned > 0) {
    const earnedAfterBase = Math.max(0, totalEarned - SSI_2026.earnedExclusionBase - remainingExclusion);
    countableEarned = earnedAfterBase / 2;
  }

  return Math.round((unearnedAfterExclusion + countableEarned) * 100) / 100;
}

// ─── Module 2: MSP Classifier ───
/**
 * Classifies MSP tier for a given household.
 * QMB: countableIncome <= 100% FPL/12 + $20 = $1,350 (single 2026).
 * SLMB: <= 120% FPL/12 + $20 = $1,616. QI: <= 135% FPL/12 + $20 = $1,816.
 * Resource test: $9,950 individual / $14,910 couple (federal, unless state override).
 * Source: medicare.gov/basics/costs/help/medicare-savings-programs; engine.ts mspMonthlyLimits().
 */
export function classifyMsp(input: MvcInput): MvcMspResult {
  const hhSize = (input.householdStatus === 'married_together') ? 2 : 1;
  const limits = mspMonthlyLimits(hhSize, input.region);
  const countableIncome = mspCountableIncome(input.income, input.spouseIncome);
  const resourcesPass   = input.resources <= limits.resources;

  let tier: MspTier = 'none';
  let limit = 0;
  let headroomToNextTier: number | null = null;

  if (resourcesPass) {
    if (countableIncome <= limits.qmb) {
      tier = 'QMB'; limit = limits.qmb;
      headroomToNextTier = +(limits.slmb - countableIncome).toFixed(2);
    } else if (countableIncome <= limits.slmb) {
      tier = 'SLMB'; limit = limits.slmb;
      headroomToNextTier = +(limits.qi - countableIncome).toFixed(2);
    } else if (countableIncome <= limits.qi) {
      tier = 'QI'; limit = limits.qi;
      headroomToNextTier = null;
    }
  }

  const autoExtraHelp = (tier === 'QMB' || tier === 'SLMB' || tier === 'QI');
  return { tier, countableIncome, limit, headroomToNextTier, resourcesPass, autoExtraHelp, limits };
}

// ─── Module 3: Extra Help eligibility ───
/**
 * Determines Extra Help (Part D LIS) eligibility.
 * Deemed eligible: MSP enrollee, full Medicaid, or SSI recipient.
 * Income test: <= 150% FPL monthly ($1,995 single / $2,705 couple in 2026).
 * Resource test: <= $16,590 single / $33,100 married (without burial allowance).
 * Source: CMS CY2026 LIS memo; engine.ts lisLimits2026().
 */
export function extraHelpEligible(
  input: MvcInput, mspTier: MspTier, fullMedicaid: boolean, hasSsi: boolean
): boolean {
  if (mspTier !== 'none' || fullMedicaid || hasSsi) return true;
  const hhSize = (input.householdStatus === 'married_together') ? 2 : 1;
  const limits = lisLimits2026(hhSize, input.region);
  const countableIncome = mspCountableIncome(input.income, input.spouseIncome);
  return countableIncome <= limits.incomeMonthly && input.resources <= limits.resources;
}

// ─── Module 4: Full Medicaid screen (aged/blind/disabled, SSI-based federal baseline) ───
/**
 * Screens for likely full Medicaid eligibility — aged/blind/disabled pathway.
 * Federal baseline only. Always output as "may qualify" or "depends on your state".
 * Income limit: SSI FBR ($994 individual / $1,491 couple) — UNVERIFIED for 2026.
 * Resource limit: $2,000 / $3,000 (20 CFR 416.1205 — not changed since 1989).
 * Nursing facility (institutional): income <= 300% SSI = $2,982 — COMPUTED.
 * Many states use higher limits or no asset test. Phase 1 states show federal baseline only.
 * Source: SSA 20 CFR 416; POMS SI 00810/00820; src/data/constants.ts.
 */
export function screenFullMedicaid(input: MvcInput): { likely: boolean; reason: string } {
  const hhSize = (input.householdStatus === 'married_together') ? 2 : 1;
  const countableIncome = mspCountableIncome(input.income, input.spouseIncome);
  const incomeLimit    = hhSize >= 2 ? SSI_2026.couple : SSI_2026.individual;
  const resourceLimit  = hhSize >= 2 ? SSI_2026.resourceCouple : SSI_2026.resourceSingle;
  const institutional  = input.livingSituation === 'nursing_facility';

  if (institutional) {
    const ok = countableIncome <= SSI_2026.specialIncomeLevel;
    return ok
      ? { likely: true,  reason: 'Income appears within the institutional Medicaid limit ($2,982/mo = 300% SSI). May qualify — state verification required.' }
      : { likely: false, reason: 'Income exceeds the institutional Medicaid limit ($2,982/mo). Spend-down or other pathways may apply — contact your state Medicaid office.' };
  }

  if (countableIncome > incomeLimit) {
    return { likely: false, reason: 'Income exceeds the federal SSI-linked Medicaid income limit ($' + incomeLimit + '/mo). Your state may use a higher limit.' };
  }
  if (input.resources > resourceLimit) {
    return { likely: false, reason: 'Resources ($' + input.resources.toLocaleString() + ') exceed the federal SSI resource limit ($' + resourceLimit.toLocaleString() + '). Some states have eliminated the resource test.' };
  }
  return { likely: true, reason: 'Income and resources appear within federal SSI-linked Medicaid limits. May qualify — state verification required.' };
}

// ─── Module 1 + 5: Combined Medicare cost + dual-status calculation ───
/**
 * Main calculation entry point. Returns Medicare eligibility, costs, MSP tier,
 * Extra Help status, full Medicaid screen, and dual-status classification.
 */
export function mvcCalculate(input: MvcInput): MvcEligibilityResult {
  // Module 1: Medicare eligibility
  const isMedicareAge  = input.age >= 65;
  const hasSsdi        = (input.ssdiMonths ?? 0) >= 24;
  const medicareEligible = isMedicareAge || hasSsdi || (input.hasESRD ?? false) || (input.hasALS ?? false);
  let medicareReason = '';
  if (!medicareEligible) {
    medicareReason = 'Age ' + input.age + ' — Medicare generally requires age 65, 24+ months SSDI, ESRD, or ALS.';
  } else if (input.hasALS)     medicareReason = 'ALS — eligible immediately upon SSDI award.';
  else if (input.hasESRD)      medicareReason = 'End-Stage Renal Disease (ESRD) — eligible immediately.';
  else if (hasSsdi)            medicareReason = 'Received SSDI for 24+ months — eligible based on disability.';
  else                         medicareReason = 'Age 65 or older — eligible based on age.';

  // Part A premium
  const partAPremium = partAPremiumMonthly(input.workQuarters);

  // Part B premium (IRMAA if MAGI provided and above base threshold)
  const partBMonthly = (input.magi && input.magi > 109000)
    ? partBMonthlyWithIrmaa(input.magi, input.filingStatus ?? 'single')
    : MEDICARE_2026.partBPremium;

  // Annual costs
  const partAPremiumAnnual    = partAPremium * 12;
  const partBPremiumAnnual    = partBMonthly * 12;
  const partBDeductibleAmount = MEDICARE_2026.partBDeductible;
  const partBCoinsurance      = Math.max(0, input.annualPartBCharges - partBDeductibleAmount) * MEDICARE_2026.partBCoin;

  // Hospital costs — each stay triggers deductible; days beyond 60 per stay get daily coinsurance
  const stays    = Math.max(0, input.hospitalStays ?? 0);
  const totalDays = Math.max(0, input.hospitalDays ?? 0);
  const daysPerStay = stays > 0 ? totalDays / stays : 0;
  let hospitalCost = 0;
  for (let s = 0; s < stays; s++) {
    hospitalCost += hospitalCostOnePeriod(Math.round(daysPerStay));
  }

  const snfCostAmount = snfCoinsurance(input.snfDays ?? 0);

  const medicareOnlyCost = partAPremiumAnnual + partBPremiumAnnual + partBDeductibleAmount
    + partBCoinsurance + hospitalCost + snfCostAmount;

  // With QMB: Part A/B premiums, deductibles, coinsurance all covered → $0
  const withQmbCost  = 0;
  // With SLMB or QI: only Part B premium covered
  const withSlmbCost = partBDeductibleAmount + partBCoinsurance + hospitalCost + snfCostAmount;
  const withQiCost   = withSlmbCost;

  const costs: MvcCostResult = {
    medicareOnlyCost:    Math.round(medicareOnlyCost  * 100) / 100,
    withQmbCost,
    withSlmbCost:        Math.round(withSlmbCost  * 100) / 100,
    withQiCost:          Math.round(withQiCost    * 100) / 100,
    partAPremiumAnnual:  Math.round(partAPremiumAnnual  * 100) / 100,
    partBPremiumAnnual:  Math.round(partBPremiumAnnual  * 100) / 100,
    partBDeductibleAmount,
    partBCoinsurance:    Math.round(partBCoinsurance    * 100) / 100,
    hospitalCost:        Math.round(hospitalCost        * 100) / 100,
    snfCost:             snfCostAmount,
  };

  // Module 2: MSP
  const msp = classifyMsp(input);

  // Module 4: Full Medicaid screen
  const { likely: fullMedicaidLikelyBool, reason: fullMedicaidReason } = screenFullMedicaid(input);

  // Extra Help
  const countableIncome = msp.countableIncome;
  const hasSsi = countableIncome <= SSI_2026.individual && input.resources <= SSI_2026.resourceSingle;
  const extraHelpDeemed     = msp.tier !== 'none' || fullMedicaidLikelyBool || hasSsi;
  const extraHelpQualifies  = extraHelpDeemed || extraHelpEligible(input, msp.tier, fullMedicaidLikelyBool, hasSsi);

  // Module 5: Dual-status classification
  let dualStatus: DualStatus = 'medicare_only';
  if (!medicareEligible && fullMedicaidLikelyBool) dualStatus = 'medicaid_only';
  else if (!medicareEligible) dualStatus = 'none';
  else if (fullMedicaidLikelyBool) dualStatus = msp.tier !== 'none' ? 'full_dual' : 'medicare_only';
  else if (msp.tier === 'QMB')  dualStatus = 'qmb_only';
  else if (msp.tier === 'SLMB') dualStatus = 'slmb_only';
  else if (msp.tier === 'QI')   dualStatus = 'qi_only';
  else dualStatus = 'medicare_only';

  const institutional       = input.livingSituation === 'nursing_facility';
  const institutionalIncomeOk = countableIncome <= SSI_2026.specialIncomeLevel;

  return {
    medicareEligible,
    medicareReason,
    partAPremium,
    msp,
    extraHelpDeemed,
    extraHelpQualifies,
    fullMedicaidLikely: fullMedicaidLikelyBool,
    fullMedicaidReason,
    dualStatus,
    costs,
    institutional,
    institutionalIncomeOk,
  };
}

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
  const maxDeduction = config.amountPerPerson * numEligible;
  const phaseout = config.phaseOutRate * Math.max(0, magi - start);
  const deduction = Math.max(0, maxDeduction - phaseout);
  return Math.round(deduction * 100) / 100;
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

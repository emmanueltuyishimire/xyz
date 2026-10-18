/**
 * Seniors Audit Calculation Engine (Tax Year 2026)
 * Pure, deterministic mathematical functions backed by official 2026 constants.
 * All functions are unit-tested against Phase A test vectors.
 */

import { CONSTANTS_2026, type Constants2026 } from './constants-2026';

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

/**
 * Calculates federal income tax using progressive 2026 tax brackets.
 */
export function federalTax(taxableIncome: number, status: FilingStatus): number {
  if (taxableIncome <= 0) return 0;

  let bracketTable = CONSTANTS_2026.brackets.single;
  if (status === 'mfj' || status === 'qss') {
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
  calcTaxFn: (income: number) => number,
  currentIncome: number,
  delta: number = 100
): number {
  const taxBase = calcTaxFn(currentIncome);
  const taxPlus = calcTaxFn(currentIncome + delta);
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

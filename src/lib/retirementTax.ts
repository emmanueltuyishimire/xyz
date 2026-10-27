/**
 * retirementTax.ts
 * Federal income tax on retirement income (Social Security, IRA/401(k), pension, interest), tax year 2026.
 * Thin wrapper over the shared engine so the calculator and the worked tables on the page use one code path.
 *
 * Federal tax only. State tax lives in the by-state calculator; withholding in the withholding calculator.
 */

import { taxableSS, calculateTaxableIncome, federalTax } from './engine';

export type RetirementFilingStatus = 'single' | 'joint';

export interface RetirementTaxInput {
  socialSecurity: number;
  iraWithdrawals: number;
  pension: number;
  interestDividends: number;
  /** tax-exempt interest (municipal bond interest) counts toward provisional income but is not taxed */
  taxExemptInterest?: number;
  status: RetirementFilingStatus;
  age65: boolean;
  spouseAge65: boolean;
}

export interface RetirementTaxResult {
  /** false when taxable income is above what the engine models (see HIGH_INCOME_MESSAGE) */
  modeled: boolean;
  totalGrossIncome: number;
  provisionalIncome: number;
  taxableSocialSecurity: number;
  /** share of Social Security benefits that is taxable, 0-85 */
  taxableSsPercent: number;
  agi: number;
  standardDeduction: number; // base + aged additions
  enhancedSeniorDeduction: number;
  taxableIncome: number;
  federalTax: number; // 0 when not modeled
  effectiveRatePct: number; // of total gross income
  numAged: number;
}

const nonNeg = (x: number) => (Number.isFinite(x) && x > 0 ? x : 0);

export function estimateRetirementTax(input: RetirementTaxInput): RetirementTaxResult {
  const ss = nonNeg(input.socialSecurity);
  const ira = nonNeg(input.iraWithdrawals);
  const pension = nonNeg(input.pension);
  const interest = nonNeg(input.interestDividends);
  const exempt = nonNeg(input.taxExemptInterest ?? 0);

  const nonSs = ira + pension + interest;
  const totalGrossIncome = ss + nonSs;
  const status = input.status === 'joint' ? 'mfj' : 'single';

  const ssRes = taxableSS({ ss, otherAGI: nonSs, taxExemptInterest: exempt, status, livedWithSpouse: true });

  let numAged = 0;
  if (input.age65) numAged++;
  if (input.status === 'joint' && input.spouseAge65) numAged++;

  const agi = nonSs + ssRes.taxableSS;
  const inc = calculateTaxableIncome({
    agi,
    status,
    numAgedBlind: numAged,
    applySeniorDeduction: true,
    numEligibleSenior: numAged,
  });

  const tax = federalTax(inc.taxableIncome, status);
  const modeled = tax !== null;
  const federal = tax ?? 0;

  return {
    modeled,
    totalGrossIncome,
    provisionalIncome: ssRes.prov,
    taxableSocialSecurity: ssRes.taxableSS,
    taxableSsPercent: ss > 0 ? Math.round((ssRes.taxableSS / ss) * 1000) / 10 : 0,
    agi,
    standardDeduction: inc.standardDeduction + inc.additionalAgedBlind,
    enhancedSeniorDeduction: inc.seniorDeductionAmount,
    taxableIncome: inc.taxableIncome,
    federalTax: federal,
    effectiveRatePct: totalGrossIncome > 0 ? (federal / totalGrossIncome) * 100 : 0,
    numAged,
  };
}

/**
 * Tax cost of the next $1,000 of IRA or pension income, as a percent. It can be above the bracket rate
 * because extra income also makes more Social Security taxable. Null when either figure is outside the modeled range.
 */
export function marginalCostOfNextThousand(input: RetirementTaxInput): number | null {
  const base = estimateRetirementTax(input);
  const more = estimateRetirementTax({ ...input, iraWithdrawals: nonNeg(input.iraWithdrawals) + 1000 });
  if (!base.modeled || !more.modeled) return null;
  return Math.round(((more.federalTax - base.federalTax) / 1000) * 1000) / 10;
}

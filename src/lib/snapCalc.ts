/**
 * snapCalc.ts
 * SNAP monthly benefit estimate for the 48 states and DC, federal fiscal year 2027 (Oct 1, 2026 - Sep 30, 2027).
 *
 * Official figures (USDA FNS, "SNAP FY 2027 Cost-of-Living Adjustments"):
 *   net income limit (100% FPL): $1,330 (1 person), $1,804 (2), $2,277 (3), $2,750 (4)
 *   gross income limit (130% FPL): $1,729, $2,345, $2,960, $3,575
 *   maximum monthly allotment: $306, $562, $808, $1,023; minimum benefit (1-2 people) $25
 *   standard deduction: $217 (1-3 people), $229 (4); maximum excess shelter deduction $769
 *
 * Rules applied (7 CFR 273.9, USDA FNS "Eligibility" and "Medical expenses guide"):
 *   - Households with a member age 60+ or receiving disability benefits skip the gross income test,
 *     may deduct medical costs above $35 a month, and have no cap on the excess shelter deduction.
 *   - Earned income gets a 20% deduction. Benefit = maximum allotment - 30% of net income.
 *
 * This is a planning estimate. States use standard utility allowances, may offer a standard medical
 * deduction, and apply their own broad-based categorical eligibility, so a caseworker's figure can differ.
 */

import { snapNetLimitFY2027, snapStandardDeductionFY2027, fplAnnual2026 } from './engine';

export const SNAP_MAX_ALLOTMENT_FY2027: Record<number, number> = { 1: 306, 2: 562, 3: 808, 4: 1023 };
export const SNAP_MIN_BENEFIT_FY2027 = 25;
export const SNAP_SHELTER_CAP_FY2027 = 769;
export const SNAP_MEDICAL_THRESHOLD = 35;

export function snapGrossLimitFY2027(size: number): number {
  return Math.ceil((fplAnnual2026(size) / 12) * 1.3 - 1e-9);
}

export interface SnapInput {
  size: number; // 1-4
  /** a member is 60+ or receives disability benefits */
  senior: boolean;
  /** Social Security, pensions, other income that is not wages (monthly, before any deduction) */
  unearned: number;
  /** wages or self-employment income (monthly, gross) */
  earned: number;
  /** Medicare premiums you pay (Part B, Part D, Medigap, Advantage) */
  medicarePremiums: number;
  /** other medical costs you pay yourself: copays, prescriptions, dental, vision, hearing aids */
  otherMedical: number;
  /** rent or mortgage, plus property tax and homeowners insurance if you pay them */
  housing: number;
  /** utilities you pay: heating/cooling, electric, water, trash, phone */
  utilities: number;
}

export interface SnapResult {
  gross: number;
  grossLimit: number;
  passesGross: boolean; // always true for senior households
  standardDeduction: number;
  earnedDeduction: number;
  medicalCosts: number;
  medicalDeduction: number;
  incomeAfterDeductions: number;
  shelterCosts: number;
  halfIncome: number;
  excessShelter: number;
  shelterCapped: boolean;
  netIncome: number;
  netLimit: number;
  passesNet: boolean;
  eligible: boolean;
  maxAllotment: number;
  benefit: number; // 0 when not eligible
  /** monthly benefit lost if the medical deduction were ignored (for the "what moves your number" box) */
  medicalDeductionValue: number;
}

const n = (x: number) => (Number.isFinite(x) && x > 0 ? x : 0);

function core(input: SnapInput, useMedical: boolean) {
  const size = Math.min(4, Math.max(1, Math.floor(input.size) || 1));
  const unearned = n(input.unearned);
  const earned = n(input.earned);
  const gross = unearned + earned;
  const standardDeduction = snapStandardDeductionFY2027(size);
  const earnedDeduction = earned * 0.2;
  const medicalCosts = n(input.medicarePremiums) + n(input.otherMedical);
  const medicalDeduction =
    input.senior && useMedical ? Math.max(0, medicalCosts - SNAP_MEDICAL_THRESHOLD) : 0;
  const incomeAfterDeductions = Math.max(0, gross - standardDeduction - earnedDeduction - medicalDeduction);
  const shelterCosts = n(input.housing) + n(input.utilities);
  const halfIncome = incomeAfterDeductions / 2;
  let excessShelter = Math.max(0, shelterCosts - halfIncome);
  let shelterCapped = false;
  if (!input.senior && excessShelter > SNAP_SHELTER_CAP_FY2027) {
    excessShelter = SNAP_SHELTER_CAP_FY2027;
    shelterCapped = true;
  }
  const netIncome = Math.max(0, incomeAfterDeductions - excessShelter);
  const netLimit = snapNetLimitFY2027(size);
  const grossLimit = snapGrossLimitFY2027(size);
  const passesGross = input.senior ? true : gross <= grossLimit;
  const passesNet = netIncome <= netLimit;
  const eligible = passesGross && passesNet;
  const maxAllotment = SNAP_MAX_ALLOTMENT_FY2027[size];
  let benefit = 0;
  if (eligible) {
    benefit = Math.max(0, Math.floor(maxAllotment - 0.3 * netIncome));
    if (size <= 2) benefit = Math.max(benefit, SNAP_MIN_BENEFIT_FY2027);
  }
  return {
    size, gross, grossLimit, passesGross, standardDeduction, earnedDeduction, medicalCosts, medicalDeduction,
    incomeAfterDeductions, shelterCosts, halfIncome, excessShelter, shelterCapped, netIncome, netLimit,
    passesNet, eligible, maxAllotment, benefit,
  };
}

export function estimateSnap(input: SnapInput): SnapResult {
  const withMed = core(input, true);
  const withoutMed = core(input, false);
  const { size: _size, ...rest } = withMed;
  return { ...rest, medicalDeductionValue: Math.max(0, withMed.benefit - withoutMed.benefit) };
}

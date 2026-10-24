/**
 * partDCost.ts
 * Month-by-month Medicare Part D out-of-pocket model (deductible -> 25% coinsurance -> annual cap -> $0).
 *
 * Official figures (Medicare.gov, "How much does Medicare drug coverage cost?",
 * https://www.medicare.gov/health-drug-plans/part-d/basics/costs):
 *   2026: out-of-pocket cap $2,100, maximum plan deductible $615
 *   2027: out-of-pocket cap $2,400, maximum plan deductible $700
 *   Initial coverage stage: 25% coinsurance after the deductible, until the cap is reached.
 *   Catastrophic stage: $0 for covered Part D drugs for the rest of the calendar year.
 *
 * This is a simplified planning model. Real plans may use flat copays by tier, set a lower deductible,
 * or price drugs differently month to month. The model says so wherever it shows a result.
 */

import { OFFICIAL_CONSTANTS } from '../data/constants';

export type PartDYear = 2026 | 2027;

export const PART_D_FIGURES: Record<PartDYear, { cap: number; maxDeductible: number }> = {
  2026: {
    cap: OFFICIAL_CONSTANTS.MEDICARE_PART_D_OOP_CAP_2026.value, // 2,100
    maxDeductible: OFFICIAL_CONSTANTS.MEDICARE_PART_D_DEDUCTIBLE_2026.value, // 615
  },
  2027: { cap: 2400, maxDeductible: 700 },
};

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export type CostMode = 'copay' | 'fullPrice';

export interface PartDInput {
  year: PartDYear;
  /** 0 = January ... 11 = December: the first month still to be projected */
  startMonth: number;
  /** Out-of-pocket spending already counted this year (the TrOOP figure on your plan statement) */
  ytdSpent: number;
  mode: CostMode;
  /** copay mode: what you pay at the pharmacy in a typical month.
   *  fullPrice mode: the plan's full price for your drugs in a typical month, before you pay anything */
  monthlyAmount: number;
  /** fullPrice mode only: plan deductible (defaults to the legal maximum for the year) */
  deductible?: number;
  /** fullPrice mode only: coinsurance after the deductible, as a percent (defaults to 25) */
  coinsurancePct?: number;
}

export type Phase = 'Deductible' | 'Coinsurance' | 'Copays' | 'Cap reached';

export interface MonthRow {
  month: number;
  name: string;
  pays: number;
  cumulative: number;
  phase: Phase;
}

export interface PartDResult {
  cap: number;
  deductible: number;
  rows: MonthRow[];
  /** month index in which the cap is reached, or null if not reached this year */
  capMonth: number | null;
  alreadyAtCap: boolean;
  remainingToCap: number;
  projectedYearTotal: number;
  /** what the same drugs would cost over the remaining months with no cap (for comparison) */
  uncappedRemaining: number;
  monthsAtZero: number;
  /** about the highest monthly bill if you join the Medicare Prescription Payment Plan now */
  paymentPlanMaxMonthly: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function simulatePartD(input: PartDInput): PartDResult {
  const { cap, maxDeductible } = PART_D_FIGURES[input.year];
  const deductible = Math.min(Math.max(0, input.deductible ?? maxDeductible), maxDeductible);
  const coins = Math.min(100, Math.max(0, input.coinsurancePct ?? 25)) / 100;
  const start = Math.min(11, Math.max(0, Math.floor(input.startMonth)));
  const monthly = Math.max(0, input.monthlyAmount);
  let troop = Math.max(0, input.ytdSpent);

  const rows: MonthRow[] = [];
  let capMonth: number | null = null;
  const alreadyAtCap = troop >= cap;
  if (alreadyAtCap) capMonth = start;

  // Uncapped comparison, same drugs, no cap (deductible and coinsurance still apply)
  let uncappedTroop = Math.max(0, input.ytdSpent);
  let uncappedRemaining = 0;

  for (let m = start; m < 12; m++) {
    // uncapped path
    let uncappedPays: number;
    if (input.mode === 'copay') {
      uncappedPays = monthly;
    } else {
      const dedLeft = Math.max(0, deductible - uncappedTroop);
      const fullPart = Math.min(monthly, dedLeft);
      uncappedPays = fullPart + (monthly - fullPart) * coins;
    }
    uncappedTroop += uncappedPays;
    uncappedRemaining += uncappedPays;

    // capped path
    const room = Math.max(0, cap - troop);
    let wanted: number;
    let phase: Phase;
    if (input.mode === 'copay') {
      wanted = monthly;
      phase = 'Copays';
    } else {
      const dedLeft = Math.max(0, deductible - troop);
      const fullPart = Math.min(monthly, dedLeft);
      wanted = fullPart + (monthly - fullPart) * coins;
      phase = dedLeft > 0 ? 'Deductible' : 'Coinsurance';
    }
    const pays = Math.min(room, wanted);
    troop += pays;
    if (room <= 0) phase = 'Cap reached';
    else if (troop >= cap - 1e-9) {
      if (capMonth === null) capMonth = m;
    }
    rows.push({ month: m, name: MONTH_NAMES[m], pays: round2(pays), cumulative: round2(troop), phase });
  }

  // A month in which the cap is reached keeps its own phase label; later months show "Cap reached"
  const monthsAtZero = rows.filter((r) => r.pays === 0 && r.phase === 'Cap reached').length;
  const remainingToCap = Math.max(0, cap - Math.max(0, input.ytdSpent));
  const monthsLeft = 12 - start;

  return {
    cap,
    deductible,
    rows,
    capMonth,
    alreadyAtCap,
    remainingToCap: round2(remainingToCap),
    projectedYearTotal: round2(troop),
    uncappedRemaining: round2(uncappedRemaining),
    monthsAtZero,
    paymentPlanMaxMonthly: round2(remainingToCap / monthsLeft),
  };
}

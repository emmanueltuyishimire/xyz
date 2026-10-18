/**
 * Phase A Test Vectors Unit Test Runner
 * Validates the shared constants and pure calculation engine against all 15 prompt test vectors
 * plus hand-derived discrepancy test vectors from IRC § 86 and 2026 constants.
 */

import fs from 'node:fs';
import path from 'node:path';

// Load 2026 shared constants
const constantsPath = path.resolve('src/lib/constants-2026.json');
const CONSTANTS = JSON.parse(fs.readFileSync(constantsPath, 'utf8'));

// Engine functions under test
export function taxableSS({ ss, otherAGI, taxExemptInterest = 0, status, livedWithSpouse = true }: {
  ss: number;
  otherAGI: number;
  taxExemptInterest?: number;
  status: 'single' | 'mfj' | 'mfs' | 'hoh' | 'qss';
  livedWithSpouse?: boolean;
}) {
  const prov = otherAGI + taxExemptInterest + 0.5 * ss;
  let base1 = CONSTANTS.socialSecurityTaxThresholds.singleBase1;
  let base2 = CONSTANTS.socialSecurityTaxThresholds.singleBase2;

  if (status === 'mfj') {
    base1 = CONSTANTS.socialSecurityTaxThresholds.mfjBase1;
    base2 = CONSTANTS.socialSecurityTaxThresholds.mfjBase2;
  } else if (status === 'mfs' && livedWithSpouse) {
    base1 = CONSTANTS.socialSecurityTaxThresholds.mfsLivedWithSpouseBase;
    base2 = CONSTANTS.socialSecurityTaxThresholds.mfsLivedWithSpouseBase;
  }

  let result = 0;
  if (prov <= base1) {
    result = 0;
  } else if (prov <= base2) {
    result = 0.5 * (prov - base1);
  } else {
    result = 0.85 * (prov - base2) + Math.min(0.5 * (base2 - base1), 0.5 * ss);
  }
  const taxableSSAmount = Math.min(result, CONSTANTS.socialSecurityTaxThresholds.maxTaxablePct * ss);

  return {
    prov,
    taxableSS: Math.round(taxableSSAmount * 100) / 100,
    base1,
    base2
  };
}

export function seniorDeduction(magi: number, status: 'single' | 'mfj' | 'mfs' | 'hoh' | 'qss', numEligible: number): number {
  if (status === 'mfs' || numEligible <= 0) return 0;
  const config = CONSTANTS.seniorDeduction;
  const start = (status === 'mfj') ? config.phaseOutStartJoint : config.phaseOutStartSingle;
  const maxDeduction = config.amountPerPerson * numEligible;
  const phaseout = config.phaseOutRate * Math.max(0, magi - start);
  const deduction = Math.max(0, maxDeduction - phaseout);
  return Math.round(deduction * 100) / 100;
}

export function calculateTaxableIncome({
  agi,
  status,
  numAgedBlind = 0,
  isItemized = false,
  itemizedAmount = 0,
  applySeniorDeduction = false,
  numEligibleSenior,
  magi
}: {
  agi: number;
  status: 'single' | 'mfj' | 'mfs' | 'hoh' | 'qss';
  numAgedBlind?: number;
  isItemized?: boolean;
  itemizedAmount?: number;
  applySeniorDeduction?: boolean;
  numEligibleSenior?: number;
  magi?: number;
}) {
  const baseStandard = CONSTANTS.standardDeduction[status] ?? CONSTANTS.standardDeduction.single;
  const addRate = (status === 'mfj' || status === 'mfs')
    ? CONSTANTS.additionalAgedBlind.married
    : CONSTANTS.additionalAgedBlind.unmarried;
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

export function federalTax(taxableIncome: number, status: 'single' | 'mfj' | 'mfs' | 'hoh' | 'qss'): number {
  if (taxableIncome <= 0) return 0;
  let bracketTable: [number, number][] = CONSTANTS.brackets.single;
  if (status === 'mfj' || status === 'qss') {
    bracketTable = CONSTANTS.brackets.mfj;
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

export function partBPenaltyPerMonth(fullYearsLate: number): number {
  if (fullYearsLate <= 0) return 0;
  const rate = CONSTANTS.medicare2026.lepRate;
  const standard = CONSTANTS.medicare2026.partBStandardPremium;
  return Math.round((rate * standard * fullYearsLate) * 100) / 100;
}

// Test reporting structure
interface TestVectorReport {
  id: string;
  name: string;
  inputs: Record<string, any>;
  engineOutput: Record<string, any>;
  expected: Record<string, any>;
  status: 'PASS' | 'FAIL';
  delta: string;
}

const reports: TestVectorReport[] = [];
let passCount = 0;
let failCount = 0;

function runVector(
  id: string,
  name: string,
  inputs: Record<string, any>,
  actual: Record<string, any>,
  expected: Record<string, any>
) {
  let passed = true;
  const deltas: string[] = [];

  for (const key of Object.keys(expected)) {
    const act = actual[key];
    const exp = expected[key];
    if (JSON.stringify(act) !== JSON.stringify(exp)) {
      passed = false;
      deltas.push(`${key}: expected ${JSON.stringify(exp)}, got ${JSON.stringify(act)}`);
    }
  }

  if (passed) {
    passCount++;
    reports.push({
      id,
      name,
      inputs,
      engineOutput: actual,
      expected,
      status: 'PASS',
      delta: 'none'
    });
    console.log(`[PASS] ${id}: ${name}`);
  } else {
    failCount++;
    reports.push({
      id,
      name,
      inputs,
      engineOutput: actual,
      expected,
      status: 'FAIL',
      delta: deltas.join('; ')
    });
    console.error(`[FAIL] ${id}: ${name} -> ${deltas.join('; ')}`);
  }
}

console.log('=============================================================================');
console.log('RUNNING PHASE A VERIFICATION TEST SUITE (15 ORIGINAL + 3 DISCREPANCY VECTORS)');
console.log('=============================================================================\n');

// Vector 1: Single 65+, SS $22,000, pension $20,000
{
  const ss = 22000;
  const otherAGI = 20000;
  const ssRes = taxableSS({ ss, otherAGI, status: 'single' });
  const agi = otherAGI + ssRes.taxableSS;
  const incNo = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: false });
  const incWith = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: true });
  const taxNo = federalTax(incNo.taxableIncome, 'single');
  const taxWith = federalTax(incWith.taxableIncome, 'single');

  runVector(
    'Vector 1',
    'Single 65+, SS $22,000, pension $20,000',
    { status: 'single', age: 65, ss: 22000, pension: 20000 },
    { prov: ssRes.prov, taxableSS: ssRes.taxableSS, agi, taxWithoutSeniorDed: taxNo, taxWithSeniorDed: taxWith },
    { prov: 31000, taxableSS: 3000, agi: 23000, taxWithoutSeniorDed: 485, taxWithSeniorDed: 0 }
  );
}

// Vector 2: Single 65+, SS $28,000, IRA $45,000
{
  const ss = 28000;
  const otherAGI = 45000;
  const ssRes = taxableSS({ ss, otherAGI, status: 'single' });
  const agi = otherAGI + ssRes.taxableSS;
  const incNo = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: false });
  const incWith = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: true });
  const taxNo = federalTax(incNo.taxableIncome, 'single');
  const taxWith = federalTax(incWith.taxableIncome, 'single');

  runVector(
    'Vector 2',
    'Single 65+, SS $28,000, IRA $45,000',
    { status: 'single', age: 65, ss: 28000, ira: 45000 },
    { taxableSS: ssRes.taxableSS, agi, taxWithoutSeniorDed: taxNo, taxWithSeniorDed: taxWith },
    { taxableSS: 23800, agi: 68800, taxWithoutSeniorDed: 5855, taxWithSeniorDed: 5110 }
  );
}

// Vector 3: Single 65+, SS $24,000, other $30,000
{
  const ss = 24000;
  const otherAGI = 30000;
  const ssRes = taxableSS({ ss, otherAGI, status: 'single' });
  const agi = otherAGI + ssRes.taxableSS;
  const incNo = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: false });
  const incWith = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: true });
  const taxNo = federalTax(incNo.taxableIncome, 'single');
  const taxWith = federalTax(incWith.taxableIncome, 'single');

  runVector(
    'Vector 3',
    'Single 65+, SS $24,000, other $30,000',
    { status: 'single', age: 65, ss: 24000, otherAGI: 30000 },
    { taxableSS: ssRes.taxableSS, agi, taxWithoutSeniorDed: taxNo, taxWithSeniorDed: taxWith },
    { taxableSS: 11300, agi: 41300, taxWithoutSeniorDed: 2530, taxWithSeniorDed: 1810 }
  );
}

// Vector 4: MFJ both 65+, SS $46,000, pension $35,000
{
  const ss = 46000;
  const otherAGI = 35000;
  const ssRes = taxableSS({ ss, otherAGI, status: 'mfj' });
  const agi = otherAGI + ssRes.taxableSS;
  const incNo = calculateTaxableIncome({ agi, status: 'mfj', numAgedBlind: 2, applySeniorDeduction: false });
  const incWith = calculateTaxableIncome({ agi, status: 'mfj', numAgedBlind: 2, applySeniorDeduction: true });
  const taxNo = federalTax(incNo.taxableIncome, 'mfj');
  const taxWith = federalTax(incWith.taxableIncome, 'mfj');

  runVector(
    'Vector 4',
    'MFJ both 65+, SS $46,000, pension $35,000',
    { status: 'mfj', both65: true, ss: 46000, pension: 35000 },
    { taxableSS: ssRes.taxableSS, agi, taxWithoutSeniorDed: taxNo, taxWithSeniorDed: taxWith },
    { taxableSS: 17900, agi: 52900, taxWithoutSeniorDed: 1740, taxWithSeniorDed: 540 }
  );
}

// Vector 5: Single 66, other $12,000, SS $24,000, IRA $20,000
{
  const otherAGI = 12000 + 20000;
  const ss = 24000;
  const ssRes = taxableSS({ ss, otherAGI, status: 'single' });
  const agi = otherAGI + ssRes.taxableSS;
  const incRes = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: true });
  const tax = federalTax(incRes.taxableIncome, 'single');
  const withholding = 20000 * 0.10;
  const balanceDue = tax - withholding;

  runVector(
    'Vector 5',
    'Single 66, other $12,000, SS $24,000, IRA $20,000',
    { status: 'single', age: 66, other: 12000, ss: 24000, ira: 20000 },
    { taxableSS: ssRes.taxableSS, agi, taxableIncome: incRes.taxableIncome, tax, balanceDue },
    { taxableSS: 13000, agi: 45000, taxableIncome: 20850, tax: 2254, balanceDue: 254 }
  );
}

// Vector 6: Single 66, SS $24k, other $12k, IRA withdrawal tiers (5k/10k/20k/30k/50k)
{
  const iraAmounts = [5000, 10000, 20000, 30000, 50000];
  const computedTaxes: number[] = [];
  let senDed50k = 0;

  for (const ira of iraAmounts) {
    const otherAGI = 12000 + ira;
    const ssRes = taxableSS({ ss: 24000, otherAGI, status: 'single' });
    const agi = otherAGI + ssRes.taxableSS;
    const incRes = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: true });
    const tax = federalTax(incRes.taxableIncome, 'single');
    computedTaxes.push(tax);
    if (ira === 50000) {
      senDed50k = incRes.seniorDeductionAmount;
    }
  }

  runVector(
    'Vector 6',
    'Single 66, IRA withdrawal tiers (5k/10k/20k/30k/50k)',
    { status: 'single', age: 66, ss: 24000, other: 12000, iraTiers: [5000, 10000, 20000, 30000, 50000] },
    { computedTaxes, seniorDeduction50kRow: senDed50k },
    { computedTaxes: [0, 235, 2254, 4342, 7625], seniorDeduction50kRow: 5556 }
  );
}

// Vector 7: Single 65+, SS $35,000, RMD $60,000
{
  const ss = 35000;
  const otherAGI = 60000;
  const ssRes = taxableSS({ ss, otherAGI, status: 'single' });
  const agi = otherAGI + ssRes.taxableSS;
  const incResWith = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: true });
  const incResNo = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: false });
  const taxWith = federalTax(incResWith.taxableIncome, 'single');
  const taxNo = federalTax(incResNo.taxableIncome, 'single');

  runVector(
    'Vector 7',
    'Single 65+, SS $35,000, RMD $60,000',
    { status: 'single', age: 65, ss: 35000, rmd: 60000 },
    { taxableSS: ssRes.taxableSS, agi, seniorDeductionAmount: incResWith.seniorDeductionAmount, taxWithSeniorDed: taxWith, taxWithoutSeniorDed: taxNo },
    { taxableSS: 29750, agi: 89750, seniorDeductionAmount: 5115, taxWithSeniorDed: 9339, taxWithoutSeniorDed: 10464 }
  );
}

// Vector 8: Single 54, wages $45,000, IRA $15,000 early withdrawal
{
  const taxBase = federalTax(calculateTaxableIncome({ agi: 45000, status: 'single', numAgedBlind: 0 }).taxableIncome, 'single');
  const taxWithIRA = federalTax(calculateTaxableIncome({ agi: 60000, status: 'single', numAgedBlind: 0 }).taxableIncome, 'single');
  const incomeTaxIncrement = taxWithIRA - taxBase;
  const penalty = 15000 * 0.10;
  const total = incomeTaxIncrement + penalty;
  const effectivePct = Math.round(((total / 15000) * 100) * 10) / 10;

  runVector(
    'Vector 8',
    'Single 54, wages $45,000, IRA $15,000 early withdrawal (no exception)',
    { status: 'single', age: 54, wages: 45000, iraEarly: 15000 },
    { incomeTaxIncrement, penalty, totalIncrement: total, effectivePct },
    { incomeTaxIncrement: 1800, penalty: 1500, totalIncrement: 3300, effectivePct: 22.0 }
  );
}

// Vector 9: MFJ both 67, SS $36,000, IRA $25,000
{
  const ss = 36000;
  const otherAGI = 25000;
  const ssRes = taxableSS({ ss, otherAGI, status: 'mfj' });
  const agi = otherAGI + ssRes.taxableSS;
  const taxWith = federalTax(calculateTaxableIncome({ agi, status: 'mfj', numAgedBlind: 2, applySeniorDeduction: true }).taxableIncome, 'mfj');

  runVector(
    'Vector 9',
    'MFJ both 67, SS $36,000, IRA $25,000',
    { status: 'mfj', both65: true, ss: 36000, ira: 25000 },
    { taxableSS: ssRes.taxableSS, taxWithSeniorDed: taxWith },
    { taxableSS: 5500, taxWithSeniorDed: 0 }
  );
}

// Vector 10: Single 65+, IRA only, $100,000 lump sum vs 4 x $25,000 spread
{
  const incNoLump = calculateTaxableIncome({ agi: 100000, status: 'single', numAgedBlind: 1, applySeniorDeduction: false });
  const taxNoLump = federalTax(incNoLump.taxableIncome, 'single');
  const incWithLump = calculateTaxableIncome({ agi: 100000, status: 'single', numAgedBlind: 1, applySeniorDeduction: true });
  const taxWithLump = federalTax(incWithLump.taxableIncome, 'single');

  const incNoSpreadYear = calculateTaxableIncome({ agi: 25000, status: 'single', numAgedBlind: 1, applySeniorDeduction: false });
  const taxNoSpread = 4 * federalTax(incNoSpreadYear.taxableIncome, 'single');
  const incWithSpreadYear = calculateTaxableIncome({ agi: 25000, status: 'single', numAgedBlind: 1, applySeniorDeduction: true });
  const taxWithSpread = 4 * federalTax(incWithSpreadYear.taxableIncome, 'single');

  const irmaaTriggered = 100000 > CONSTANTS.medicare2026.irmaaTiersSingleMAGI2024[0];

  runVector(
    'Vector 10',
    'Single 65+, IRA only, $100k lump vs 4x$25k spread',
    { status: 'single', age: 65, lumpAmount: 100000, spreadAmount: 25000 },
    { taxNoLump, taxWithLump, taxNoSpread, taxWithSpread, irmaaTriggered },
    { taxNoLump: 12719, taxWithLump: 11729, taxNoSpread: 2740, taxWithSpread: 340, irmaaTriggered: false }
  );
}

// Vector 11: Single 65+, SS $26,000 + pension $28,800
{
  const ss = 26000;
  const otherAGI = 28800;
  const ssRes = taxableSS({ ss, otherAGI, status: 'single' });
  const agi = otherAGI + ssRes.taxableSS;
  const incNo = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: false });
  const incWith = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: true });
  const taxNo = federalTax(incNo.taxableIncome, 'single');
  const taxWith = federalTax(incWith.taxableIncome, 'single');

  runVector(
    'Vector 11',
    'Single 65+, SS $26,000 + pension $28,800',
    { status: 'single', age: 65, ss: 26000, pension: 28800 },
    { taxableSS: ssRes.taxableSS, taxWithoutSeniorDed: taxNo, taxWithSeniorDed: taxWith },
    { taxableSS: 11130, taxWithoutSeniorDed: 2366, taxWithSeniorDed: 1646 }
  );
}

// Vector 12: Single 65+, SS $28,000 + annuity $18,000 (David original base)
{
  const ss = 28000;
  const otherAGI = 18000;
  const ssRes = taxableSS({ ss, otherAGI, status: 'single' });
  const agi = otherAGI + ssRes.taxableSS;
  const incNo = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: false });
  const incWith = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: true });
  const taxNo = federalTax(incNo.taxableIncome, 'single');
  const taxWith = federalTax(incWith.taxableIncome, 'single');

  runVector(
    'Vector 12',
    'Single 65+, SS $28,000 + annuity $18,000',
    { status: 'single', age: 65, ss: 28000, annuity: 18000 },
    { taxableSS: ssRes.taxableSS, taxWithoutSeniorDed: taxNo, taxWithSeniorDed: taxWith },
    { taxableSS: 3500, taxWithoutSeniorDed: 335, taxWithSeniorDed: 0 }
  );
}

// Vector 13: MFJ both 65+, SS $38,000 + pension $30,000
{
  const ss = 38000;
  const otherAGI = 30000;
  const ssRes = taxableSS({ ss, otherAGI, status: 'mfj' });
  const agi = otherAGI + ssRes.taxableSS;
  const incNo = calculateTaxableIncome({ agi, status: 'mfj', numAgedBlind: 2, applySeniorDeduction: false });
  const incWith = calculateTaxableIncome({ agi, status: 'mfj', numAgedBlind: 2, applySeniorDeduction: true });
  const taxNo = federalTax(incNo.taxableIncome, 'mfj');
  const taxWith = federalTax(incWith.taxableIncome, 'mfj');

  runVector(
    'Vector 13',
    'MFJ both 65+, SS $38,000 + pension $30,000',
    { status: 'mfj', both65: true, ss: 38000, pension: 30000 },
    { taxableSS: ssRes.taxableSS, taxWithoutSeniorDed: taxNo, taxWithSeniorDed: taxWith },
    { taxableSS: 10250, taxWithoutSeniorDed: 475, taxWithSeniorDed: 0 }
  );
}

// Vector 14: Single 65+, pension $32,000 + RMD $14,000
{
  const agi = 32000 + 14000;
  const incNo = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: false });
  const incWith = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: true });
  const taxNo = federalTax(incNo.taxableIncome, 'single');
  const taxWith = federalTax(incWith.taxableIncome, 'single');

  runVector(
    'Vector 14',
    'Single 65+, pension $32,000 + RMD $14,000',
    { status: 'single', age: 65, pension: 32000, rmd: 14000 },
    { taxWithoutSeniorDed: taxNo, taxWithSeniorDed: taxWith },
    { taxWithoutSeniorDed: 3094, taxWithSeniorDed: 2374 }
  );
}

// Vector 15: Part B penalty, 2 full years late
{
  const penalty = partBPenaltyPerMonth(2);

  runVector(
    'Vector 15',
    'Part B late penalty, 2 full years late (24 mos)',
    { fullYearsLate: 2 },
    { monthlyPenalty: penalty },
    { monthlyPenalty: 40.58 }
  );
}

// --- HAND-DERIVED EXTRA DISCREPANCY VECTORS ---

// Discrepancy Vector 1: Single 72, SS $30,000, other $40,000
// Hand derivation: Prov = 40000 + 15000 = 55000.
// Taxable SS: Tier 1 = 4500, Tier 2 = 0.85*(55000-34000) = 17850. Total = 22350 (<= 85% of 30k = 25500).
// AGI = 40000 + 22350 = 62350. Standard ded (65+) = 18150.
// Taxable income without senior ded = 44200. Tax = 1240 + 0.12*(44200 - 12400) = 1240 + 3816 = 5056.
// Senior ded: MAGI 62350 <= 75000 -> 6000. Taxable inc with senior ded = 38200.
// Tax with senior ded = 1240 + 0.12*(38200 - 12400) = 1240 + 3096 = 4336.
{
  const ss = 30000;
  const otherAGI = 40000;
  const ssRes = taxableSS({ ss, otherAGI, status: 'single' });
  const agi = otherAGI + ssRes.taxableSS;
  const incNo = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: false });
  const incWith = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: true });
  const taxNo = federalTax(incNo.taxableIncome, 'single');
  const taxWith = federalTax(incWith.taxableIncome, 'single');

  runVector(
    'Discrepancy Vector 1',
    'Single 72, SS $30,000, other $40,000 (Hand-derived IRC § 86)',
    { status: 'single', age: 72, ss: 30000, otherAGI: 40000 },
    { taxableSS: ssRes.taxableSS, agi, taxWithoutSeniorDed: taxNo, taxWithSeniorDed: taxWith },
    { taxableSS: 22350, agi: 62350, taxWithoutSeniorDed: 5056, taxWithSeniorDed: 4336 }
  );
}

// Discrepancy Vector 2: Single 68, SS $28,000, other $35,000
// Hand derivation: Prov = 35000 + 14000 = 49000.
// Taxable SS: Tier 1 = 4500, Tier 2 = 0.85*(49000-34000) = 12750. Total = 17250.
// AGI = 35000 + 17250 = 52250. Standard ded = 18150. Taxable inc without senior ded = 34100.
// Tax without senior ded = 1240 + 0.12*(34100 - 12400) = 1240 + 2604 = 3844.
// Senior ded: 6000. Taxable inc with senior ded = 28100.
// Tax with senior ded = 1240 + 0.12*(28100 - 12400) = 1240 + 1884 = 3124.
{
  const ss = 28000;
  const otherAGI = 35000;
  const ssRes = taxableSS({ ss, otherAGI, status: 'single' });
  const agi = otherAGI + ssRes.taxableSS;
  const incNo = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: false });
  const incWith = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: true });
  const taxNo = federalTax(incNo.taxableIncome, 'single');
  const taxWith = federalTax(incWith.taxableIncome, 'single');

  runVector(
    'Discrepancy Vector 2',
    'Single 68, SS $28,000, other $35,000 (Hand-derived IRC § 86)',
    { status: 'single', age: 68, ss: 28000, otherAGI: 35000 },
    { taxableSS: ssRes.taxableSS, agi, taxWithoutSeniorDed: taxNo, taxWithSeniorDed: taxWith },
    { taxableSS: 17250, agi: 52250, taxWithoutSeniorDed: 3844, taxWithSeniorDed: 3124 }
  );
}

// Discrepancy Vector 3: David (Updated Scenario 4): Single 68, SS $30,000, pension $30,000
// Hand derivation: Prov = 30000 + 15000 = 45000.
// Taxable SS: Tier 1 = 4500, Tier 2 = 0.85*(45000-34000) = 9350. Total = 13850.
// AGI = 30000 + 13850 = 43850. Standard ded = 18150. Taxable inc without senior ded = 25700.
// Tax without senior ded = 1240 + 0.12*(25700 - 12400) = 1240 + 1596 = 2836.
// Senior ded = 6000. Taxable inc with senior ded = 19700.
// Tax with senior ded = 1240 + 0.12*(19700 - 12400) = 1240 + 876 = 2116.
{
  const ss = 30000;
  const otherAGI = 30000;
  const ssRes = taxableSS({ ss, otherAGI, status: 'single' });
  const agi = otherAGI + ssRes.taxableSS;
  const incNo = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: false });
  const incWith = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: true });
  const taxNo = federalTax(incNo.taxableIncome, 'single');
  const taxWith = federalTax(incWith.taxableIncome, 'single');

  runVector(
    'Discrepancy Vector 3',
    'David (Scenario 4): Single 68, SS $30,000, pension $30,000',
    { status: 'single', age: 68, ss: 30000, pension: 30000 },
    { taxableSS: ssRes.taxableSS, agi, taxWithoutSeniorDed: taxNo, taxWithSeniorDed: taxWith },
    { taxableSS: 13850, agi: 43850, taxWithoutSeniorDed: 2836, taxWithSeniorDed: 2116 }
  );
}

console.log('\n=============================================================================');
console.log(`SUMMARY: Total: ${reports.length} | Passed: ${passCount} | Failed: ${failCount}`);
console.log('=============================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('SUCCESS: All 18 test vectors (15 original + 3 hand-derived) passed with 0 deltas!\n');
}

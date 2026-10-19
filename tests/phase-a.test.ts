/**
 * Phase A Test Vectors Unit Test Runner
 * Validates the shared calculation engine against:
 * 1. All 15 original user prompt test vectors
 * 2. Hand-derived discrepancy vectors from IRC § 86 and 2026 constants (including David and Items 4a, 4b)
 * 3. Medicare coverage effective date tests under CMS regulations and SSA POMS HI 00805
 */

import {
  taxableSS,
  seniorDeduction,
  calculateTaxableIncome,
  federalTax,
  partBPenaltyPerMonth,
  calculateMedicareCoverageDates
} from '../src/lib/engine.ts';
import { CONSTANTS_2026 } from '../src/lib/constants-2026.ts';

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
    console.log(`  Expected: ${JSON.stringify(expected)}`);
    console.log(`  Actual:   ${JSON.stringify(actual)}`);
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
    console.error(`  Expected: ${JSON.stringify(expected)}`);
    console.error(`  Actual:   ${JSON.stringify(actual)}`);
  }
}

console.log('=============================================================================');
console.log('RUNNING PHASE A VERIFICATION TEST SUITE (ORIGINAL + DISCREPANCIES + MEDICARE)');
console.log('=============================================================================\n');

// ── ORIGINAL 15 VECTORS ────────────────────────────────────────────────────────

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

  const irmaaTriggered = 100000 > CONSTANTS_2026.medicare2026.irmaaTiersSingleMAGI2024[0];

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

// Vector 12: Single 65+, SS $28,000 + annuity $18,000
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

// ── HAND-DERIVED DISCREPANCY VECTORS ──────────────────────────────────────────

// Discrepancy Vector 1: Single 72, SS $30,000, other $40,000
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

// Discrepancy Vector 3: David (Scenario 4): Single 68, SS $30,000, pension $30,000
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

// Item 4a Vector: Single, age 68, SS 24,000, pension 18,000, IRA 12,000 (other income 30,000)
{
  const ss = 24000;
  const otherAGI = 18000 + 12000; // 30000
  const ssRes = taxableSS({ ss, otherAGI, status: 'single' });
  const agi = otherAGI + ssRes.taxableSS;
  const incNo = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: false });
  const incWith = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: true });
  const taxNo = federalTax(incNo.taxableIncome, 'single');
  const taxWith = federalTax(incWith.taxableIncome, 'single');

  runVector(
    'Item 4a Vector',
    'Single 68, SS $24,000, pension $18,000, IRA $12,000 (other $30,000)',
    { status: 'single', age: 68, ss: 24000, otherAGI: 30000 },
    { taxableSS: ssRes.taxableSS, agi, taxWithoutSeniorDed: taxNo, taxWithSeniorDed: taxWith },
    { taxableSS: 11300, agi: 41300, taxWithoutSeniorDed: 2530, taxWithSeniorDed: 1810 }
  );
}

// Item 4b Vector: Single, age 70, SS 32,000, pension 24,000, IRA 15,000 (other income 39,000)
{
  const ss = 32000;
  const otherAGI = 24000 + 15000; // 39000
  const ssRes = taxableSS({ ss, otherAGI, status: 'single' });
  const agi = otherAGI + ssRes.taxableSS;
  const incNo = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: false });
  const incWith = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: true });
  const taxNo = federalTax(incNo.taxableIncome, 'single');
  const taxWith = federalTax(incWith.taxableIncome, 'single');

  runVector(
    'Item 4b Vector',
    'Single 70, SS $32,000, pension $24,000, IRA $15,000 (other $39,000)',
    { status: 'single', age: 70, ss: 32000, otherAGI: 39000 },
    { taxableSS: ssRes.taxableSS, agi, taxWithoutSeniorDed: taxNo, taxWithSeniorDed: taxWith },
    { taxableSS: 22350, agi: 61350, taxWithoutSeniorDed: 4936, taxWithSeniorDed: 4216 }
  );
}

// ── MEDICARE COVERAGE DATE TESTS (ITEM 5) ────────────────────────────────────

// Medicare Date Test 1: Born 1961-06-15, sign up 2026-06 → Part B 2026-07-01; premium-free Part A 2026-06-01
{
  const res = calculateMedicareCoverageDates({ birthDate: '1961-06-15', signUpDate: '2026-06' });
  runVector(
    'Medicare Date Test 1',
    'Born 1961-06-15, sign up 2026-06',
    { birthDate: '1961-06-15', signUpDate: '2026-06' },
    { partB: res.partBEffectiveDate, partA: res.partAEffectiveDate },
    { partB: '2026-07-01', partA: '2026-06-01' }
  );
}

// Medicare Date Test 2: Born 1961-03-15, sign up 2026-01 → Parts A and B 2026-03-01
{
  const res = calculateMedicareCoverageDates({ birthDate: '1961-03-15', signUpDate: '2026-01' });
  runVector(
    'Medicare Date Test 2',
    'Born 1961-03-15, sign up 2026-01',
    { birthDate: '1961-03-15', signUpDate: '2026-01' },
    { partB: res.partBEffectiveDate, partA: res.partAEffectiveDate },
    { partB: '2026-03-01', partA: '2026-03-01' }
  );
}

// Medicare Date Test 3: Born 1960-10-08, sign up 2026-01 → Part B 2026-02-01; Part A 2025-10-01
{
  const res = calculateMedicareCoverageDates({ birthDate: '1960-10-08', signUpDate: '2026-01' });
  runVector(
    'Medicare Date Test 3',
    'Born 1960-10-08, sign up 2026-01',
    { birthDate: '1960-10-08', signUpDate: '2026-01' },
    { partB: res.partBEffectiveDate, partA: res.partAEffectiveDate },
    { partB: '2026-02-01', partA: '2025-10-01' }
  );
}

// Medicare Date Test 4: Born 1961-07-01, sign up 2026-03 → treated as turning 65 in 2026-06; Part B 2026-06-01
{
  const res = calculateMedicareCoverageDates({ birthDate: '1961-07-01', signUpDate: '2026-03' });
  runVector(
    'Medicare Date Test 4',
    'Born 1961-07-01 (1st of month), sign up 2026-03',
    { birthDate: '1961-07-01', signUpDate: '2026-03' },
    { partB: res.partBEffectiveDate, note: res.treatedTurning65Note },
    { partB: '2026-06-01', note: 'treated as turning 65 in 2026-06' }
  );
}

// Medicare Date Test 5: Born 1961-06-15, sign up 2026-09 → Part B 2026-10-01 and premium-free Part A 2026-06-01
{
  const res = calculateMedicareCoverageDates({ birthDate: '1961-06-15', signUpDate: '2026-09' });
  runVector(
    'Medicare Date Test 5',
    'Born 1961-06-15, sign up 2026-09 (Month 7 of IEP)',
    { birthDate: '1961-06-15', signUpDate: '2026-09' },
    { partB: res.partBEffectiveDate, partA: res.partAEffectiveDate },
    { partB: '2026-10-01', partA: '2026-06-01' }
  );
}

// Medicare Date Test 6: Out-of-window sign-up (Born 1961-06-15, sign up 2026-11, no employer coverage) → GEP / penalty path
{
  const res = calculateMedicareCoverageDates({ birthDate: '1961-06-15', signUpDate: '2026-11', hasEmployerCoverage: false });
  runVector(
    'Medicare Date Test 6',
    'Out-of-window sign-up: Born 1961-06-15, sign up 2026-11 (post-IEP, no employer coverage)',
    { birthDate: '1961-06-15', signUpDate: '2026-11', hasEmployerCoverage: false },
    { isOutOfWindow: res.isOutOfWindow, gepRequired: res.gepRequired, penaltyApplies: res.penaltyApplies, enrollmentPeriod: res.enrollmentPeriod },
    { isOutOfWindow: true, gepRequired: true, penaltyApplies: true, enrollmentPeriod: 'GEP' }
  );
}

// ── MEDICARE ITEM 1(c) SPECIFIC TESTS ──────────────────────────────────────────

// Item 1c-1: Born 1961-06-15, sign up 2026-08 → Part B 2026-09-01, Part A 2026-06-01
{
  const res = calculateMedicareCoverageDates({ birthDate: '1961-06-15', signUpDate: '2026-08' });
  runVector(
    'Medicare Item 1c-1',
    'Born 1961-06-15, sign up 2026-08 (month 6 of IEP)',
    { birthDate: '1961-06-15', signUpDate: '2026-08' },
    { partB: res.partBEffectiveDate, partA: res.partAEffectiveDate },
    { partB: '2026-09-01', partA: '2026-06-01' }
  );
}

// Item 1c-2: Born 1960-12-10, sign up 2026-01 → inside IEP (Dec 2025 birthday month, IEP Sep 2025–Mar 2026), Part B 2026-02-01
{
  const res = calculateMedicareCoverageDates({ birthDate: '1960-12-10', signUpDate: '2026-01' });
  runVector(
    'Medicare Item 1c-2',
    'Born 1960-12-10, sign up 2026-01 (inside IEP: month after Dec 2025 birth month)',
    { birthDate: '1960-12-10', signUpDate: '2026-01' },
    { partB: res.partBEffectiveDate, enrollmentPeriod: res.enrollmentPeriod },
    { partB: '2026-02-01', enrollmentPeriod: 'IEP' }
  );
}

// Item 1c-3: Born 1961-06-15, sign up 2027-02 → GEP, Part B 2027-03-01, penalty applies
{
  const res = calculateMedicareCoverageDates({ birthDate: '1961-06-15', signUpDate: '2027-02' });
  runVector(
    'Medicare Item 1c-3',
    'Born 1961-06-15, sign up 2027-02 (GEP)',
    { birthDate: '1961-06-15', signUpDate: '2027-02' },
    { partB: res.partBEffectiveDate, enrollmentPeriod: res.enrollmentPeriod, penaltyApplies: res.penaltyApplies },
    { partB: '2027-03-01', enrollmentPeriod: 'GEP', penaltyApplies: true }
  );
}

// ── ITEM 4: HIGH-INCOME HANDLING TESTS ─────────────────────────────────────────

// Single with taxable income $250,000 -> federalTax returns null
{
  const res = federalTax(250000, 'single');
  runVector(
    'High-Income Single',
    'Taxable income $250,000 single (> $201,775 cap)',
    { taxableIncome: 250000, status: 'single' },
    { result: res },
    { result: null }
  );
}

// MFJ with taxable income $450,000 -> federalTax returns null
{
  const res = federalTax(450000, 'mfj');
  runVector(
    'High-Income MFJ',
    'Taxable income $450,000 mfj (> $403,550 cap)',
    { taxableIncome: 450000, status: 'mfj' },
    { result: res },
    { result: null }
  );
}

// ── ITEM 3: COMPONENT SCREEN ASSERTIONS ─────────────────────────────────────────

// Screen Assertion 1: IRA default (Single 66, pension $12k, SS $24k, IRA withdrawal $20k)
// Expected: $2,254 tax, taxable SS $13,000
{
  const ssRes = taxableSS({ ss: 24000, otherAGI: 32000, status: 'single' });
  const agi = 32000 + ssRes.taxableSS;
  const incRes = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: true, numEligibleSenior: 1 });
  const tax = federalTax(incRes.taxableIncome, 'single');
  runVector(
    'Screen IRA Default',
    'IRA Default: Single 66, pension $12k, SS $24k, IRA withdrawal $20k',
    { ss: 24000, pension: 12000, withdrawal: 20000 },
    { taxableSS: ssRes.taxableSS, tax },
    { taxableSS: 13000, tax: 2254 }
  );
}

// Screen Assertion 2: SS tax default (Single 65+, SS $22k, other income $20k)
// Expected: $485 tax without senior deduction / $0 with senior deduction
{
  const ssRes = taxableSS({ ss: 22000, otherAGI: 20000, status: 'single' });
  const agi = 20000 + ssRes.taxableSS;
  const incNo = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: false });
  const incWith = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: true, numEligibleSenior: 1 });
  const taxNo = federalTax(incNo.taxableIncome, 'single');
  const taxWith = federalTax(incWith.taxableIncome, 'single');
  runVector(
    'Screen SS Tax Default',
    'SS Tax Default: Single 65+, SS $22k, other $20k',
    { ss: 22000, other: 20000 },
    { taxWithoutSenior: taxNo, taxWithSenior: taxWith },
    { taxWithoutSenior: 485, taxWithSenior: 0 }
  );
}

// Screen Assertion 3: Withholding Example 1 (Single 68, SS $26k, pension $28.8k)
// Expected: $2,366 / $1,646
{
  const ssRes = taxableSS({ ss: 26000, otherAGI: 28800, status: 'single' });
  const agi = 28800 + ssRes.taxableSS;
  const incNo = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: false });
  const incWith = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: true, numEligibleSenior: 1 });
  const taxNo = federalTax(incNo.taxableIncome, 'single');
  const taxWith = federalTax(incWith.taxableIncome, 'single');
  runVector(
    'Screen Withholding Example 1',
    'Withholding Example 1: Single 68, SS $26k, pension $28.8k',
    { ss: 26000, pension: 28800 },
    { taxWithoutSenior: taxNo, taxWithSenior: taxWith },
    { taxWithoutSenior: 2366, taxWithSenior: 1646 }
  );
}

// Screen Assertion 4: State Scenario 2 (Single 74, SS $35k, RMD $60k)
// Expected: $10,464 / $9,339
{
  const ssRes = taxableSS({ ss: 35000, otherAGI: 60000, status: 'single' });
  const agi = 60000 + ssRes.taxableSS;
  const incNo = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: false });
  const incWith = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: true, numEligibleSenior: 1 });
  const taxNo = federalTax(incNo.taxableIncome, 'single');
  const taxWith = federalTax(incWith.taxableIncome, 'single');
  runVector(
    'Screen State Scenario 2',
    'State Scenario 2: Single 74, SS $35k, RMD $60k',
    { ss: 35000, rmd: 60000 },
    { taxWithoutSenior: taxNo, taxWithSenior: taxWith },
    { taxWithoutSenior: 10464, taxWithSenior: 9339 }
  );
}

// ── ITEM 1d: INDEPENDENT HAND-DERIVED MFJ VECTORS ──────────────────────────────
{
  // Vector 1: SS 61,623, other 21,162, TEI 3,000
  // Prov = 21,162 + 3,000 + 30,811.50 = 54,973.50
  // Base1 = 32,000, Base2 = 44,000
  // Result = 0.85 * (54,973.50 - 44,000) + min(0.5 * 12,000, 30,811.50)
  //        = 0.85 * 10,973.50 + 6,000 = 9,327.475 + 6,000 = 15,327.475 -> 15,327
  const res1 = taxableSS({ ss: 61623, otherAGI: 21162, taxExemptInterest: 3000, status: 'mfj' });
  runVector(
    'Hand-Derived MFJ Vector 1',
    'MFJ: SS $61,623, other $21,162, TEI $3,000',
    { ss: 61623, other: 21162, tei: 3000, status: 'mfj' },
    { prov: res1.prov, taxableSS: Math.round(res1.taxableSS) },
    { prov: 54973.5, taxableSS: 15327 }
  );

  // Vector 2: SS 49,200, other 34,500, TEI 0
  // Prov = 34,500 + 0 + 24,600 = 59,100
  // Result = 0.85 * (59,100 - 44,000) + 6,000 = 0.85 * 15,100 + 6,000 = 12,835 + 6,000 = 18,835
  const res2 = taxableSS({ ss: 49200, otherAGI: 34500, taxExemptInterest: 0, status: 'mfj' });
  runVector(
    'Hand-Derived MFJ Vector 2',
    'MFJ: SS $49,200, other $34,500, TEI $0',
    { ss: 49200, other: 34500, tei: 0, status: 'mfj' },
    { prov: res2.prov, taxableSS: Math.round(res2.taxableSS) },
    { prov: 59100, taxableSS: 18835 }
  );

  // Vector 3: SS 46,000, other 35,000, TEI 0
  // Prov = 35,000 + 0 + 23,000 = 58,000
  // Result = 0.85 * (58,000 - 44,000) + 6,000 = 0.85 * 14,000 + 6,000 = 11,900 + 6,000 = 17,900
  const res3 = taxableSS({ ss: 46000, otherAGI: 35000, taxExemptInterest: 0, status: 'mfj' });
  runVector(
    'Hand-Derived MFJ Vector 3',
    'MFJ: SS $46,000, other $35,000, TEI $0',
    { ss: 46000, other: 35000, tei: 0, status: 'mfj' },
    { prov: res3.prov, taxableSS: Math.round(res3.taxableSS) },
    { prov: 58000, taxableSS: 17900 }
  );
}

// ── ITEM 2: MFS LIVED TOGETHER VS LIVED APART TESTS ───────────────────────────
{
  // Case A: MFS Lived With Spouse (livedWithSpouse: true) -> Base1 = 0, Base2 = 0
  // Prov = 15,000 + 10,000 = 25,000 -> 85% of prov = 21,250 capped at 85% of SS = 17,000
  // Senior deduction must be $0 for MFS
  const resTogether = taxableSS({ ss: 20000, otherAGI: 15000, status: 'mfs', livedWithSpouse: true });
  const senDedTogether = seniorDeduction(32000, 'mfs', 1);
  runVector(
    'MFS Lived Together',
    'MFS lived with spouse all year: SS $20,000, other $15,000',
    { ss: 20000, other: 15000, status: 'mfs', livedWithSpouse: true },
    { taxableSS: resTogether.taxableSS, base1: resTogether.base1, base2: resTogether.base2, seniorDeduction: senDedTogether },
    { taxableSS: 17000, base1: 0, base2: 0, seniorDeduction: 0 }
  );

  // Case B: MFS Lived Apart All Year (livedWithSpouse: false) -> Base1 = 25,000, Base2 = 34,000
  // Prov = 15,000 + 10,000 = 25,000 <= 25,000 -> taxable SS = 0
  // Senior deduction must still be $0 for MFS
  const resApart = taxableSS({ ss: 20000, otherAGI: 15000, status: 'mfs', livedWithSpouse: false });
  const senDedApart = seniorDeduction(15000, 'mfs', 1);
  runVector(
    'MFS Lived Apart All Year',
    'MFS lived apart from spouse all year: SS $20,000, other $15,000',
    { ss: 20000, other: 15000, status: 'mfs', livedWithSpouse: false },
    { taxableSS: resApart.taxableSS, base1: resApart.base1, base2: resApart.base2, seniorDeduction: senDedApart },
    { taxableSS: 0, base1: 25000, base2: 34000, seniorDeduction: 0 }
  );
}

// ── ITEM 4: MEDICARE BIRTH YEAR 1968 TEST ──────────────────────────────────────
{
  // Born 1968-04-10, sign up 2033-04 (turns 65 in 2033, sign up during birthday month)
  // IEP: Jan 2033 to Jul 2033
  // Part B starts first day of next month -> 2033-05-01
  // Part A starts birthday month -> 2033-04-01
  const med1968 = calculateMedicareCoverageDates({
    birthDate: '1968-04-10',
    signUpDate: '2033-04',
  });
  runVector(
    'Medicare Date 1968 Birth Year',
    'Born 1968-04-10, sign up 2033-04 (birthday month)',
    { birthDate: '1968-04-10', signUpDate: '2033-04' },
    { partBStart: med1968.partBEffectiveDate, partAStart: med1968.partAEffectiveDate, iepOpen: med1968.iepOpenDate, iepClose: med1968.iepCloseDate },
    { partBStart: '2033-05-01', partAStart: '2033-04-01', iepOpen: '2033-01-01', iepClose: '2033-07-31' }
  );
}

console.log('\n=============================================================================');
console.log(`SUMMARY: Total: ${reports.length} | Passed: ${passCount} | Failed: ${failCount}`);
console.log('=============================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log(`SUCCESS: All ${reports.length} test vectors passed with 0 deltas!\n`);
}

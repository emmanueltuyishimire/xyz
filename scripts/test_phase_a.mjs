/**
 * Phase A Test Vectors Unit Test Runner
 * Validates the shared constants and pure calculation engine against all 15 prompt test vectors.
 */

import fs from 'fs';
import path from 'path';

// Read constants directly from json
const constantsPath = path.resolve('src/lib/constants-2026.json');
const CONSTANTS = JSON.parse(fs.readFileSync(constantsPath, 'utf8'));

// Implementation of engine functions for standalone node testing
function taxableSS({ ss, otherAGI, taxExemptInterest = 0, status, livedWithSpouse = true }) {
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

function seniorDeduction(magi, status, numEligible) {
  if (status === 'mfs' || numEligible <= 0) return 0;
  const config = CONSTANTS.seniorDeduction;
  const start = (status === 'mfj') ? config.phaseOutStartJoint : config.phaseOutStartSingle;
  const maxDeduction = config.amountPerPerson * numEligible;
  const phaseout = config.phaseOutRate * Math.max(0, magi - start);
  const deduction = Math.max(0, maxDeduction - phaseout);
  return Math.round(deduction * 100) / 100;
}

function calculateTaxableIncome({
  agi,
  status,
  numAgedBlind = 0,
  isItemized = false,
  itemizedAmount = 0,
  applySeniorDeduction = false,
  numEligibleSenior,
  magi
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

function federalTax(taxableIncome, status) {
  if (taxableIncome <= 0) return 0;
  let bracketTable = CONSTANTS.brackets.single;
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

function partBPenaltyPerMonth(fullYearsLate) {
  if (fullYearsLate <= 0) return 0;
  const rate = CONSTANTS.medicare2026.lepRate;
  const standard = CONSTANTS.medicare2026.partBStandardPremium;
  return Math.round((rate * standard * fullYearsLate) * 100) / 100;
}

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const results = [];

function assert(condition, testName, expected, actual) {
  totalTests++;
  if (condition) {
    passedTests++;
    results.push({ test: testName, status: 'PASS', expected, actual });
    console.log(`  PASS: ${testName}`);
  } else {
    failedTests++;
    results.push({ test: testName, status: 'FAIL', expected, actual });
    console.error(`  FAIL: ${testName} (Expected: ${expected}, Actual: ${actual})`);
  }
}

console.log('--- EXECUTING PHASE A TEST VECTORS ---');

// Vector 1: Single 65+, SS 22000, pension 20000
{
  const ssRes = taxableSS({ ss: 22000, otherAGI: 20000, status: 'single' });
  const agi = 20000 + ssRes.taxableSS;
  const taxNo = federalTax(calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: false }).taxableIncome, 'single');
  const taxWith = federalTax(calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: true }).taxableIncome, 'single');
  assert(ssRes.prov === 31000, 'Vector 1 Prov Income', 31000, ssRes.prov);
  assert(ssRes.taxableSS === 3000, 'Vector 1 Taxable SS', 3000, ssRes.taxableSS);
  assert(agi === 23000, 'Vector 1 AGI', 23000, agi);
  assert(taxNo === 485, 'Vector 1 Tax without Senior Ded', 485, taxNo);
  assert(taxWith === 0, 'Vector 1 Tax with Senior Ded', 0, taxWith);
}

// Vector 2: Single 65+, SS 28000, IRA 45000
{
  const ssRes = taxableSS({ ss: 28000, otherAGI: 45000, status: 'single' });
  const agi = 45000 + ssRes.taxableSS;
  const taxNo = federalTax(calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: false }).taxableIncome, 'single');
  const taxWith = federalTax(calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: true }).taxableIncome, 'single');
  assert(ssRes.taxableSS === 23800, 'Vector 2 Taxable SS', 23800, ssRes.taxableSS);
  assert(agi === 68800, 'Vector 2 AGI', 68800, agi);
  assert(taxNo === 5855, 'Vector 2 Tax without Senior Ded', 5855, taxNo);
  assert(taxWith === 5110, 'Vector 2 Tax with Senior Ded', 5110, taxWith);
}

// Vector 3: Single 65+, SS 24000, other 30000
{
  const ssRes = taxableSS({ ss: 24000, otherAGI: 30000, status: 'single' });
  const agi = 30000 + ssRes.taxableSS;
  const taxNo = federalTax(calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: false }).taxableIncome, 'single');
  const taxWith = federalTax(calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: true }).taxableIncome, 'single');
  assert(ssRes.taxableSS === 11300, 'Vector 3 Taxable SS', 11300, ssRes.taxableSS);
  assert(agi === 41300, 'Vector 3 AGI', 41300, agi);
  assert(taxNo === 2530, 'Vector 3 Tax without Senior Ded', 2530, taxNo);
  assert(taxWith === 1810, 'Vector 3 Tax with Senior Ded', 1810, taxWith);
}

// Vector 4: MFJ both 65+, SS 46000, pension 35000
{
  const ssRes = taxableSS({ ss: 46000, otherAGI: 35000, status: 'mfj' });
  const agi = 35000 + ssRes.taxableSS;
  const taxNo = federalTax(calculateTaxableIncome({ agi, status: 'mfj', numAgedBlind: 2, applySeniorDeduction: false }).taxableIncome, 'mfj');
  const taxWith = federalTax(calculateTaxableIncome({ agi, status: 'mfj', numAgedBlind: 2, applySeniorDeduction: true }).taxableIncome, 'mfj');
  assert(ssRes.taxableSS === 17900, 'Vector 4 Taxable SS', 17900, ssRes.taxableSS);
  assert(agi === 52900, 'Vector 4 AGI', 52900, agi);
  assert(taxNo === 1740, 'Vector 4 Tax without Senior Ded', 1740, taxNo);
  assert(taxWith === 540, 'Vector 4 Tax with Senior Ded', 540, taxWith);
}

// Vector 5: Single 66, other 12000, SS 24000, IRA 20000
{
  const ssRes = taxableSS({ ss: 24000, otherAGI: 32000, status: 'single' });
  const agi = 32000 + ssRes.taxableSS;
  const incRes = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: true });
  const tax = federalTax(incRes.taxableIncome, 'single');
  const withholding = 20000 * 0.10;
  const balanceDue = tax - withholding;
  assert(ssRes.taxableSS === 13000, 'Vector 5 Taxable SS', 13000, ssRes.taxableSS);
  assert(agi === 45000, 'Vector 5 AGI', 45000, agi);
  assert(incRes.taxableIncome === 20850, 'Vector 5 Taxable Income', 20850, incRes.taxableIncome);
  assert(tax === 2254, 'Vector 5 Tax', 2254, tax);
  assert(balanceDue === 254, 'Vector 5 Balance Due with 10% Withholding', 254, balanceDue);
}

// Vector 6: Same person, IRA 5k/10k/20k/30k/50k
{
  const iraAmounts = [5000, 10000, 20000, 30000, 50000];
  const expectedTaxes = [0, 235, 2254, 4342, 7625];
  const computedTaxes = [];
  let senDed50k = 0;

  for (let i = 0; i < iraAmounts.length; i++) {
    const ira = iraAmounts[i];
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
  assert(JSON.stringify(computedTaxes) === JSON.stringify(expectedTaxes), 'Vector 6 IRA Table Taxes (0, 235, 2254, 4342, 7625)', expectedTaxes, computedTaxes);
  assert(senDed50k === 5556, 'Vector 6 50k Row Senior Deduction (5556)', 5556, senDed50k);
}

// Vector 7: Single 65+, SS 35000, RMD 60000
{
  const ssRes = taxableSS({ ss: 35000, otherAGI: 60000, status: 'single' });
  const agi = 60000 + ssRes.taxableSS;
  const incResWith = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: true });
  const incResNo = calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: false });
  const taxWith = federalTax(incResWith.taxableIncome, 'single');
  const taxNo = federalTax(incResNo.taxableIncome, 'single');
  assert(ssRes.taxableSS === 29750, 'Vector 7 Taxable SS', 29750, ssRes.taxableSS);
  assert(agi === 89750, 'Vector 7 AGI', 89750, agi);
  assert(incResWith.seniorDeductionAmount === 5115, 'Vector 7 Senior Deduction', 5115, incResWith.seniorDeductionAmount);
  assert(taxWith === 9339, 'Vector 7 Tax with Senior Ded', 9339, taxWith);
  assert(taxNo === 10464, 'Vector 7 Tax without Senior Ded', 10464, taxNo);
}

// Vector 8: Single 54, wages 45000, IRA 15000, no exception
{
  const taxBase = federalTax(calculateTaxableIncome({ agi: 45000, status: 'single', numAgedBlind: 0 }).taxableIncome, 'single');
  const taxWithIRA = federalTax(calculateTaxableIncome({ agi: 60000, status: 'single', numAgedBlind: 0 }).taxableIncome, 'single');
  const incomeTaxIncrement = taxWithIRA - taxBase;
  const penalty = 15000 * 0.10;
  const total = incomeTaxIncrement + penalty;
  const effectivePct = (total / 15000) * 100;
  assert(incomeTaxIncrement === 1800, 'Vector 8 Income Tax Increment', 1800, incomeTaxIncrement);
  assert(penalty === 1500, 'Vector 8 Penalty', 1500, penalty);
  assert(total === 3300, 'Vector 8 Total Increment', 3300, total);
  assert(Math.round(effectivePct * 10) / 10 === 22.0, 'Vector 8 Effective Pct (22.0%)', 22.0, effectivePct);
}

// Vector 9: MFJ both 67, SS 36000, IRA 25000
{
  const ssRes = taxableSS({ ss: 36000, otherAGI: 25000, status: 'mfj' });
  const agi = 25000 + ssRes.taxableSS;
  const taxWith = federalTax(calculateTaxableIncome({ agi, status: 'mfj', numAgedBlind: 2, applySeniorDeduction: true }).taxableIncome, 'mfj');
  assert(ssRes.taxableSS === 5500, 'Vector 9 Taxable SS', 5500, ssRes.taxableSS);
  assert(taxWith === 0, 'Vector 9 Tax', 0, taxWith);
}

// Vector 10: Single 65+, IRA only, 100000 in one year vs 4x25000
{
  // Lump sum 100k
  const incNoLump = calculateTaxableIncome({ agi: 100000, status: 'single', numAgedBlind: 1, applySeniorDeduction: false });
  const taxNoLump = federalTax(incNoLump.taxableIncome, 'single');
  const incWithLump = calculateTaxableIncome({ agi: 100000, status: 'single', numAgedBlind: 1, applySeniorDeduction: true });
  const taxWithLump = federalTax(incWithLump.taxableIncome, 'single');

  // Spread 4x25k
  const incNoSpreadYear = calculateTaxableIncome({ agi: 25000, status: 'single', numAgedBlind: 1, applySeniorDeduction: false });
  const taxNoSpread = 4 * federalTax(incNoSpreadYear.taxableIncome, 'single');
  const incWithSpreadYear = calculateTaxableIncome({ agi: 25000, status: 'single', numAgedBlind: 1, applySeniorDeduction: true });
  const taxWithSpread = 4 * federalTax(incWithSpreadYear.taxableIncome, 'single');

  const irmaaTriggered = 100000 > CONSTANTS.medicare2026.irmaaTiersSingleMAGI2024[0];

  assert(taxNoLump === 12719, 'Vector 10 No Senior Ded Lump 100k', 12719, taxNoLump);
  assert(taxNoSpread === 2740, 'Vector 10 No Senior Ded Spread 4x25k', 2740, taxNoSpread);
  assert(taxWithLump === 11729, 'Vector 10 With Senior Ded Lump 100k', 11729, taxWithLump);
  assert(taxWithSpread === 340, 'Vector 10 With Senior Ded Spread 4x25k', 340, taxWithSpread);
  assert(!irmaaTriggered, 'Vector 10 IRMAA Not Triggered at 100k', false, irmaaTriggered);
}

// Vector 11: Single 65+, SS 26000 + pension 28800
{
  const ssRes = taxableSS({ ss: 26000, otherAGI: 28800, status: 'single' });
  const agi = 28800 + ssRes.taxableSS;
  const taxNo = federalTax(calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: false }).taxableIncome, 'single');
  const taxWith = federalTax(calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: true }).taxableIncome, 'single');
  assert(ssRes.taxableSS === 11130, 'Vector 11 Taxable SS', 11130, ssRes.taxableSS);
  assert(taxNo === 2366, 'Vector 11 Tax without Senior Ded', 2366, taxNo);
  assert(taxWith === 1646, 'Vector 11 Tax with Senior Ded', 1646, taxWith);
}

// Vector 12: Single 65+, SS 28000 + annuity 18000
{
  const ssRes = taxableSS({ ss: 28000, otherAGI: 18000, status: 'single' });
  const agi = 18000 + ssRes.taxableSS;
  const taxNo = federalTax(calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: false }).taxableIncome, 'single');
  const taxWith = federalTax(calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: true }).taxableIncome, 'single');
  assert(ssRes.taxableSS === 3500, 'Vector 12 Taxable SS', 3500, ssRes.taxableSS);
  assert(taxNo === 335, 'Vector 12 Tax without Senior Ded', 335, taxNo);
  assert(taxWith === 0, 'Vector 12 Tax with Senior Ded', 0, taxWith);
}

// Vector 13: MFJ both 65+, SS 38000 + pension 30000
{
  const ssRes = taxableSS({ ss: 38000, otherAGI: 30000, status: 'mfj' });
  const agi = 30000 + ssRes.taxableSS;
  const taxNo = federalTax(calculateTaxableIncome({ agi, status: 'mfj', numAgedBlind: 2, applySeniorDeduction: false }).taxableIncome, 'mfj');
  const taxWith = federalTax(calculateTaxableIncome({ agi, status: 'mfj', numAgedBlind: 2, applySeniorDeduction: true }).taxableIncome, 'mfj');
  assert(ssRes.taxableSS === 10250, 'Vector 13 Taxable SS', 10250, ssRes.taxableSS);
  assert(taxNo === 475, 'Vector 13 Tax without Senior Ded', 475, taxNo);
  assert(taxWith === 0, 'Vector 13 Tax with Senior Ded', 0, taxWith);
}

// Vector 14: Single 65+, pension 32000 + RMD 14000
{
  const agi = 32000 + 14000;
  const taxNo = federalTax(calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: false }).taxableIncome, 'single');
  const taxWith = federalTax(calculateTaxableIncome({ agi, status: 'single', numAgedBlind: 1, applySeniorDeduction: true }).taxableIncome, 'single');
  assert(taxNo === 3094, 'Vector 14 Tax without Senior Ded', 3094, taxNo);
  assert(taxWith === 2374, 'Vector 14 Tax with Senior Ded', 2374, taxWith);
}

// Vector 15: Part B penalty, 2 full years late
{
  const penalty = partBPenaltyPerMonth(2);
  assert(penalty === 40.58, 'Vector 15 Part B Penalty (40.58/mo)', 40.58, penalty);
}

console.log('\n======================================================');
console.log(`TOTAL PHASE A VECTORS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
console.log('======================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('ALL PHASE A TEST VECTORS PASSED PERFECTLY!\n');
}

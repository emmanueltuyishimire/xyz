/**
 * Screen Render & Assertion Tests
 * Verifies that the canonical inputs for each tool produce the exact on-screen values matching the engine.
 */

import {
  taxableSS,
  seniorDeduction,
  calculateTaxableIncome,
  federalTax,
  marginalRate,
  calculateRequiredPayment,
  calculateShortfall,
  w4vRate,
  calculateMedicareCoverageDates,
} from '../src/lib/engine.ts';

interface ScreenTestResult {
  tool: string;
  scenario: string;
  assertions: { field: string; expected: any; actual: any; match: boolean }[];
  passed: boolean;
}

const results: ScreenTestResult[] = [];

// 1. IRA WITHDRAWAL TAX CALCULATOR
{
  const inputs = {
    age: 66,
    filingStatus: 'single' as const,
    pension: 12000,
    ss: 24000,
    withdrawal: 20000,
  };

  // Base state (no withdrawal)
  const baseNonSS = inputs.pension;
  const baseSSRes = taxableSS({ ss: inputs.ss, otherAGI: baseNonSS, status: inputs.filingStatus });
  const baseAGI = baseNonSS + baseSSRes.taxableSS;
  const baseIncRes = calculateTaxableIncome({ agi: baseAGI, status: inputs.filingStatus, numAgedBlind: 1, applySeniorDeduction: true, numEligibleSenior: 1 });
  const baseTax = federalTax(baseIncRes.taxableIncome, inputs.filingStatus) ?? 0;

  // With withdrawal
  const withNonSS = inputs.pension + inputs.withdrawal;
  const withSSRes = taxableSS({ ss: inputs.ss, otherAGI: withNonSS, status: inputs.filingStatus });
  const withAGI = withNonSS + withSSRes.taxableSS;
  const withIncRes = calculateTaxableIncome({ agi: withAGI, status: inputs.filingStatus, numAgedBlind: 1, applySeniorDeduction: true, numEligibleSenior: 1 });
  const withTax = federalTax(withIncRes.taxableIncome, inputs.filingStatus) ?? 0;

  const incrementalTax = withTax - baseTax;
  const additionalTaxableSS = withSSRes.taxableSS - baseSSRes.taxableSS;
  const effRate = ((incrementalTax / inputs.withdrawal) * 100).toFixed(1);

  const assertions = [
    { field: 'Base Taxable SS', expected: 0, actual: baseSSRes.taxableSS, match: baseSSRes.taxableSS === 0 },
    { field: 'With-Withdrawal Taxable SS', expected: 13000, actual: withSSRes.taxableSS, match: withSSRes.taxableSS === 13000 },
    { field: 'Additional Taxable SS', expected: 13000, actual: additionalTaxableSS, match: additionalTaxableSS === 13000 },
    { field: 'Base Federal Tax', expected: 0, actual: baseTax, match: baseTax === 0 },
    { field: 'Estimated Federal Tax with Withdrawal', expected: 2254, actual: withTax, match: withTax === 2254 },
    { field: 'Incremental Tax on Withdrawal', expected: 2254, actual: incrementalTax, match: incrementalTax === 2254 },
    { field: 'Effective Rate on Withdrawal', expected: '11.3', actual: effRate, match: effRate === '11.3' },
  ];

  results.push({
    tool: 'IRA Withdrawal Tax Calculator',
    scenario: 'Single 66, pension $12k, SS $24k, IRA withdrawal $20k',
    assertions,
    passed: assertions.every(a => a.match),
  });
}

// 2. SOCIAL SECURITY TAX CALCULATOR
{
  const inputs = {
    filingStatus: 'single' as const,
    age65Plus: true,
    ss: 24000,
    other: 30000,
  };

  const ssRes = taxableSS({ ss: inputs.ss, otherAGI: inputs.other, status: inputs.filingStatus });
  const agi = inputs.other + ssRes.taxableSS;
  const incNo = calculateTaxableIncome({ agi, status: inputs.filingStatus, numAgedBlind: 1, applySeniorDeduction: false });
  const incWith = calculateTaxableIncome({ agi, status: inputs.filingStatus, numAgedBlind: 1, applySeniorDeduction: true, numEligibleSenior: 1 });
  const taxNo = federalTax(incNo.taxableIncome, inputs.filingStatus);
  const taxWith = federalTax(incWith.taxableIncome, inputs.filingStatus);

  const assertions = [
    { field: 'Taxable SS', expected: 11300, actual: ssRes.taxableSS, match: ssRes.taxableSS === 11300 },
    { field: 'AGI', expected: 41300, actual: agi, match: agi === 41300 },
    { field: 'Tax without Senior Deduction', expected: 2530, actual: taxNo, match: taxNo === 2530 },
    { field: 'Tax with Senior Deduction', expected: 1810, actual: taxWith, match: taxWith === 1810 },
  ];

  results.push({
    tool: 'Social Security Tax Calculator',
    scenario: 'Single 68, SS $24k, pension $18k, IRA $12k (other $30k)',
    assertions,
    passed: assertions.every(a => a.match),
  });
}

// 3. RETIREMENT TAX WITHHOLDING CALCULATOR
{
  const inputs = {
    filingStatus: 'single' as const,
    age: 68,
    ss: 26000,
    pension: 28800,
    priorTax: 1600,
    priorAGI: 38000,
  };

  const ssRes = taxableSS({ ss: inputs.ss, otherAGI: inputs.pension, status: inputs.filingStatus });
  const agi = inputs.pension + ssRes.taxableSS;
  const incWith = calculateTaxableIncome({ agi, status: inputs.filingStatus, numAgedBlind: 1, applySeniorDeduction: true, numEligibleSenior: 1 });
  const taxWith = federalTax(incWith.taxableIncome, inputs.filingStatus) ?? 0;
  const reqPayment = calculateRequiredPayment(taxWith, inputs.priorTax, inputs.priorAGI, inputs.filingStatus);
  const shortfall = calculateShortfall(reqPayment, 0, 0, 0);
  const recW4V = w4vRate(shortfall, inputs.ss);

  const assertions = [
    { field: 'Taxable SS', expected: 11130, actual: ssRes.taxableSS, match: ssRes.taxableSS === 11130 },
    { field: 'AGI', expected: 39930, actual: agi, match: agi === 39930 },
    { field: 'Estimated Federal Tax', expected: 1646, actual: taxWith, match: taxWith === 1646 },
    { field: 'Required Annual Payment', expected: 1481.4, actual: reqPayment, match: reqPayment === 1481.4 },
    { field: 'Annual Shortfall (0 withheld)', expected: 1481.4, actual: shortfall, match: shortfall === 1481.4 },
    { field: 'Recommended W-4V Rate', expected: 0.07, actual: recW4V, match: recW4V === 0.07 },
  ];

  results.push({
    tool: 'Retirement Tax Withholding Calculator',
    scenario: 'Single 68, SS $26k, pension $28.8k, prior tax $1,600',
    assertions,
    passed: assertions.every(a => a.match),
  });
}

// 4. RETIREMENT TAX BY STATE CALCULATOR
{
  const inputs = {
    filingStatus: 'single' as const,
    age: 74,
    ss: 35000,
    rmd: 60000,
  };

  const ssRes = taxableSS({ ss: inputs.ss, otherAGI: inputs.rmd, status: inputs.filingStatus });
  const agi = inputs.rmd + ssRes.taxableSS;
  const incNo = calculateTaxableIncome({ agi, status: inputs.filingStatus, numAgedBlind: 1, applySeniorDeduction: false });
  const incWith = calculateTaxableIncome({ agi, status: inputs.filingStatus, numAgedBlind: 1, applySeniorDeduction: true, numEligibleSenior: 1 });
  const taxNo = federalTax(incNo.taxableIncome, inputs.filingStatus);
  const taxWith = federalTax(incWith.taxableIncome, inputs.filingStatus);

  const assertions = [
    { field: 'Taxable SS', expected: 29750, actual: ssRes.taxableSS, match: ssRes.taxableSS === 29750 },
    { field: 'AGI', expected: 89750, actual: agi, match: agi === 89750 },
    { field: 'Federal Tax Without Senior Deduction', expected: 10464, actual: taxNo, match: taxNo === 10464 },
    { field: 'Federal Tax With Senior Deduction', expected: 9339, actual: taxWith, match: taxWith === 9339 },
    { field: 'Senior Deduction Amount', expected: 5115, actual: incWith.seniorDeductionAmount, match: incWith.seniorDeductionAmount === 5115 },
  ];

  results.push({
    tool: 'Retirement Tax by State',
    scenario: 'Single 74, SS $35k, RMD $60k (Scenario 2)',
    assertions,
    passed: assertions.every(a => a.match),
  });
}

// 5. MEDICARE EFFECTIVE DATE CALCULATOR
{
  const dates = calculateMedicareCoverageDates({
    birthDate: '1961-06-15',
    signUpDate: '2026-06',
  });

  const assertions = [
    { field: 'Part A Effective Date', expected: '2026-06-01', actual: dates.partAEffectiveDate, match: dates.partAEffectiveDate === '2026-06-01' },
    { field: 'Part B Effective Date', expected: '2026-07-01', actual: dates.partBEffectiveDate, match: dates.partBEffectiveDate === '2026-07-01' },
    { field: 'IEP Open Date', expected: '2026-03-01', actual: dates.iepOpenDate, match: dates.iepOpenDate === '2026-03-01' },
    { field: 'IEP Close Date', expected: '2026-09-30', actual: dates.iepCloseDate, match: dates.iepCloseDate === '2026-09-30' },
  ];

  results.push({
    tool: 'Medicare Effective Date Calculator',
    scenario: 'Born 1961-06-15, sign up 2026-06 (birthday month)',
    assertions,
    passed: assertions.every(a => a.match),
  });
}

// PRINT RESULTS
console.log('=============================================================================');
console.log('SCREEN RENDER & ASSERTION TESTS ACROSS ALL 5 TOOLS');
console.log('=============================================================================');

let allPassed = true;
for (const res of results) {
  console.log(`\nTool: ${res.tool}`);
  console.log(`Scenario: ${res.scenario}`);
  console.log(`Status: ${res.passed ? 'PASS' : 'FAIL'}`);
  for (const a of res.assertions) {
    console.log(`  - ${a.field}: expected=${a.expected}, actual=${a.actual} [${a.match ? 'MATCH' : 'MISMATCH'}]`);
  }
  if (!res.passed) allPassed = false;
}

console.log('\n=============================================================================');
if (allPassed) {
  console.log('SUCCESS: All screen assertions across all 5 tools passed with 100% exact matches!');
} else {
  console.error('FAILURE: One or more screen assertions failed!');
  process.exit(1);
}

/**
 * test_enhanced_senior_deduction.mjs
 * Verifies the $6,000 Enhanced Senior Deduction per IRS Schedule 1-A (Form 1040)
 * Three test cases: single modest, joint in phaseout, single high income (fully phased out)
 */

// Replicate the function exactly as implemented in the calculators
function calcEnhancedSeniorDeduction(magi, filingStatus, age65Plus, spouseAge65Plus) {
  if (filingStatus === 'mfs') return 0;
  const isMFJ = filingStatus === 'mfj' || filingStatus === 'joint' || filingStatus === 'qss';
  const threshold = isMFJ ? 150000 : 75000;
  const excess = Math.max(0, magi - threshold);
  const phaseout = excess * 0.06;
  const perPerson = Math.max(0, 6000 - phaseout);
  let count = 0;
  if (age65Plus) count++;
  if ((filingStatus === 'mfj' || filingStatus === 'joint') && spouseAge65Plus) count++;
  return perPerson * count;
}

// Simple 2026 tax calculation (single brackets from Rev. Proc. 2025-32)
function calcFederalTaxSingle(taxableIncome) {
  if (taxableIncome <= 0) return 0;
  const brackets = [
    { min: 0, max: 12400, rate: 0.10 },
    { min: 12400, max: 50400, rate: 0.12 },
    { min: 50400, max: 105700, rate: 0.22 },
    { min: 105700, max: 201775, rate: 0.24 },
    { min: 201775, max: 256225, rate: 0.32 },
    { min: 256225, max: 640600, rate: 0.35 },
    { min: 640600, max: Infinity, rate: 0.37 },
  ];
  let tax = 0;
  for (const b of brackets) {
    if (taxableIncome <= b.min) break;
    const top = Math.min(taxableIncome, b.max);
    tax += (top - b.min) * b.rate;
  }
  return tax;
}

function calcFederalTaxMFJ(taxableIncome) {
  if (taxableIncome <= 0) return 0;
  const brackets = [
    { min: 0, max: 24800, rate: 0.10 },
    { min: 24800, max: 100800, rate: 0.12 },
    { min: 100800, max: 211400, rate: 0.22 },
    { min: 211400, max: 403550, rate: 0.24 },
    { min: 403550, max: 512450, rate: 0.32 },
    { min: 512450, max: 768700, rate: 0.35 },
    { min: 768700, max: Infinity, rate: 0.37 },
  ];
  let tax = 0;
  for (const b of brackets) {
    if (taxableIncome <= b.min) break;
    const top = Math.min(taxableIncome, b.max);
    tax += (top - b.min) * b.rate;
  }
  return tax;
}

const fmt = n => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmt2 = n => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

console.log('=== ENHANCED SENIOR DEDUCTION — THREE TEST CASES ===\n');

// ── TEST CASE 1: Single, age 67, modest income ($40,000 AGI) ──────────────
{
  const label = 'Test Case 1: Single, age 67, AGI $40,000 (below $75,000 phaseout)';
  const agi = 40000;
  const stdDed = 16100;       // 2026 single
  const seniorAddl = 2050;    // §63(f) single age 65+
  const totalStd = stdDed + seniorAddl; // $18,150
  
  // WITHOUT enhanced deduction
  const taxableWithout = Math.max(0, agi - totalStd);
  const taxWithout = calcFederalTaxSingle(taxableWithout);
  
  // WITH enhanced deduction  
  const enhDed = calcEnhancedSeniorDeduction(agi, 'single', true, false);
  const taxableWith = Math.max(0, agi - totalStd - enhDed);
  const taxWith = calcFederalTaxSingle(taxableWith);
  
  console.log(label);
  console.log(`  AGI: ${fmt(agi)}`);
  console.log(`  Standard Deduction (incl §63(f)): ${fmt(totalStd)}`);
  console.log(`  Enhanced Senior Deduction: ${fmt(enhDed)}`);
  console.log(`  BEFORE: Taxable Income = ${fmt(taxableWithout)}, Federal Tax = ${fmt2(taxWithout)}`);
  console.log(`  AFTER:  Taxable Income = ${fmt(taxableWith)}, Federal Tax = ${fmt2(taxWith)}`);
  console.log(`  Tax Savings: ${fmt2(taxWithout - taxWith)}`);
  console.log();
}

// ── TEST CASE 2: MFJ, both 68, combined AGI $200,000 (in phaseout) ────────
{
  const label = 'Test Case 2: MFJ, both 68, AGI $200,000 (in phaseout zone)';
  const agi = 200000;
  const stdDed = 32200;          // 2026 MFJ
  const seniorAddl = 1650 * 2;   // §63(f) married, both 65+
  const totalStd = stdDed + seniorAddl; // $35,500
  
  // WITHOUT enhanced deduction
  const taxableWithout = Math.max(0, agi - totalStd);
  const taxWithout = calcFederalTaxMFJ(taxableWithout);
  
  // WITH enhanced deduction
  const enhDed = calcEnhancedSeniorDeduction(agi, 'mfj', true, true);
  const taxableWith = Math.max(0, agi - totalStd - enhDed);
  const taxWith = calcFederalTaxMFJ(taxableWith);
  
  // Manual verification: MAGI=$200,000, threshold=$150,000
  // excess = $50,000; phaseout = $50,000 * 0.06 = $3,000
  // perPerson = $6,000 - $3,000 = $3,000; count=2; total = $6,000
  
  console.log(label);
  console.log(`  AGI: ${fmt(agi)}`);
  console.log(`  Standard Deduction (incl §63(f)): ${fmt(totalStd)}`);
  console.log(`  Enhanced Senior Deduction: ${fmt(enhDed)} (phaseout applies: $50k excess × 6% = $3k reduction per person)`);
  console.log(`  BEFORE: Taxable Income = ${fmt(taxableWithout)}, Federal Tax = ${fmt2(taxWithout)}`);
  console.log(`  AFTER:  Taxable Income = ${fmt(taxableWith)}, Federal Tax = ${fmt2(taxWith)}`);
  console.log(`  Tax Savings: ${fmt2(taxWithout - taxWith)}`);
  console.log();
}

// ── TEST CASE 3: Single, age 70, AGI $200,000 (fully phased out) ──────────
{
  const label = 'Test Case 3: Single, age 70, AGI $200,000 (above $175,000 full phaseout)';
  const agi = 200000;
  const stdDed = 16100;       // 2026 single
  const seniorAddl = 2050;    // §63(f) single age 65+
  const totalStd = stdDed + seniorAddl; // $18,150
  
  // WITHOUT enhanced deduction
  const taxableWithout = Math.max(0, agi - totalStd);
  const taxWithout = calcFederalTaxSingle(taxableWithout);
  
  // WITH enhanced deduction
  const enhDed = calcEnhancedSeniorDeduction(agi, 'single', true, false);
  const taxableWith = Math.max(0, agi - totalStd - enhDed);
  const taxWith = calcFederalTaxSingle(taxableWith);
  
  // Manual verification: MAGI=$200,000, threshold=$75,000
  // excess = $125,000; phaseout = $125,000 * 0.06 = $7,500
  // perPerson = $6,000 - $7,500 = -$1,500 → clamped to $0
  // Total = $0. Fully phased out.
  
  console.log(label);
  console.log(`  AGI: ${fmt(agi)}`);
  console.log(`  Standard Deduction (incl §63(f)): ${fmt(totalStd)}`);
  console.log(`  Enhanced Senior Deduction: ${fmt(enhDed)} (fully phased out at $175k single)`);
  console.log(`  BEFORE: Taxable Income = ${fmt(taxableWithout)}, Federal Tax = ${fmt2(taxWithout)}`);
  console.log(`  AFTER:  Taxable Income = ${fmt(taxableWith)}, Federal Tax = ${fmt2(taxWith)}`);
  console.log(`  Tax Savings: ${fmt2(taxWithout - taxWith)}`);
  console.log();
}

console.log('=== ALL THREE TEST CASES COMPLETE ===');

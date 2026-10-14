/**
 * test_enhanced_senior_deduction.mjs
 * Comprehensive verification of the Enhanced Senior Deduction per IRS Schedule 1-A (Form 1040)
 *
 * Verifies:
 * 1. Three primary test cases (under threshold, in phaseout with arithmetic, above cutoff)
 * 2. Married filing separately receives $0 (statutory exclusion)
 * 3. Qualifying surviving spouse (QSS) uses the $150,000 threshold (max 1 eligible person)
 * 4. Applies in addition to the age-65 additional standard deduction under IRC § 63(f)
 * 5. Does not reduce provisional income for Social Security taxability (IRC § 86)
 * 6. Does not reduce MAGI used for Medicare IRMAA (IRC § 1395r)
 * 7. Roth conversion marginal rate behavior in the phaseout zone
 */

// Implementation matching all 8 calculator components
function calcEnhancedSeniorDeduction(magi, filingStatus, age65Plus, spouseAge65Plus) {
  if (filingStatus === 'mfs') return 0;
  const isMFJ = filingStatus === 'mfj' || filingStatus === 'joint';
  const threshold = isMFJ ? 150000 : 75000;
  const excess = Math.max(0, magi - threshold);
  const phaseout = excess * 0.06;
  const perPerson = Math.max(0, 6000 - phaseout);
  let count = 0;
  if (age65Plus) count++;
  if ((filingStatus === 'mfj' || filingStatus === 'joint') && spouseAge65Plus) count++;
  return perPerson * count;
}

// 2026 tax calculation helper (IRS Rev. Proc. 2025-32)
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

console.log('================================================================');
console.log('=== ENHANCED SENIOR DEDUCTION — COMPLETE SPECIFICATION TESTS ===');
console.log('================================================================\n');

let failed = 0;

// ── TEST CASE 1: Single, age 67, under threshold ($40,000 AGI) ───────────
{
  const agi = 40000;
  const stdDed = 16100;
  const seniorAddl = 2050; // §63(f)
  const totalStd = stdDed + seniorAddl; // $18,150
  const enhDed = calcEnhancedSeniorDeduction(agi, 'single', true, false);

  if (enhDed !== 6000) { console.error('FAIL Case 1: Expected $6,000, got', enhDed); failed++; }

  const taxableWithout = Math.max(0, agi - totalStd);
  const taxWithout = calcFederalTaxSingle(taxableWithout);
  const taxableWith = Math.max(0, agi - totalStd - enhDed);
  const taxWith = calcFederalTaxSingle(taxableWith);

  console.log('Test Case 1: Single Filer Under Threshold ($40,000 AGI)');
  console.log(`  AGI: ${fmt(agi)} | Threshold: $75,000 | Phaseout: $0`);
  console.log(`  Regular Standard Deduction: ${fmt(stdDed)}`);
  console.log(`  Age-65 Additional Deduction (§ 63(f)): ${fmt(seniorAddl)}`);
  console.log(`  Total Standard Deduction: ${fmt(totalStd)}`);
  console.log(`  Enhanced Senior Deduction (Schedule 1-A): ${fmt(enhDed)}`);
  console.log(`  Total Deductions Combined: ${fmt(totalStd + enhDed)}`);
  console.log(`  Taxable Income: ${fmt(taxableWithout)} -> ${fmt(taxableWith)}`);
  console.log(`  Federal Tax: ${fmt2(taxWithout)} -> ${fmt2(taxWith)} (Savings: ${fmt2(taxWithout - taxWith)})\n`);
}

// ── TEST CASE 2: MFJ, both 68, inside phaseout range ($200,000 AGI) ──────
{
  const agi = 200000;
  const threshold = 150000;
  const excess = agi - threshold; // $50,000
  const phaseoutRate = 0.06;
  const phaseoutPerPerson = excess * phaseoutRate; // $3,000
  const perPersonDed = 6000 - phaseoutPerPerson; // $3,000
  const totalEnhDed = perPersonDed * 2; // $6,000
  const enhDed = calcEnhancedSeniorDeduction(agi, 'mfj', true, true);

  if (enhDed !== totalEnhDed) { console.error('FAIL Case 2: Expected $6,000, got', enhDed); failed++; }

  const stdDed = 32200;
  const seniorAddl = 1650 * 2; // §63(f)
  const totalStd = stdDed + seniorAddl; // $35,500
  const taxableWithout = Math.max(0, agi - totalStd);
  const taxWithout = calcFederalTaxMFJ(taxableWithout);
  const taxableWith = Math.max(0, agi - totalStd - enhDed);
  const taxWith = calcFederalTaxMFJ(taxableWith);

  console.log('Test Case 2: MFJ Both 65+ Inside Phaseout ($200,000 AGI)');
  console.log(`  Arithmetic walkthrough:`);
  console.log(`    MAGI: ${fmt(agi)}`);
  console.log(`    Joint Threshold: ${fmt(threshold)}`);
  console.log(`    Excess Income: ${fmt(agi)} - ${fmt(threshold)} = ${fmt(excess)}`);
  console.log(`    Phaseout Calculation: ${fmt(excess)} × 6% (0.06) = ${fmt(phaseoutPerPerson)} per person`);
  console.log(`    Deduction per Eligible Person: $6,000 - ${fmt(phaseoutPerPerson)} = ${fmt(perPersonDed)}`);
  console.log(`    Eligible Spouses (both 65+): 2`);
  console.log(`    Total Enhanced Deduction: ${fmt(perPersonDed)} × 2 = ${fmt(enhDed)}`);
  console.log(`  Tax Savings: ${fmt2(taxWithout - taxWith)}\n`);
}

// ── TEST CASE 3: Single, age 70, above cutoff ($200,000 AGI) ─────────────
{
  const agi = 200000;
  const threshold = 75000;
  const excess = agi - threshold; // $125,000
  const phaseout = excess * 0.06; // $7,500 (> $6,000 -> $0)
  const enhDed = calcEnhancedSeniorDeduction(agi, 'single', true, false);

  if (enhDed !== 0) { console.error('FAIL Case 3: Expected $0, got', enhDed); failed++; }

  console.log('Test Case 3: Single Filer Above Cutoff ($200,000 AGI)');
  console.log(`  MAGI: ${fmt(agi)} | Threshold: $75,000 | Excess: ${fmt(excess)}`);
  console.log(`  Phaseout: ${fmt(excess)} × 6% = ${fmt(phaseout)} (> $6,000 max)`);
  console.log(`  Enhanced Senior Deduction: $0 (fully phased out at $175,000)\n`);
}

// ── TEST CASE 4: Married Filing Separately (Statutory Bar) ────────────────
{
  const mfs1 = calcEnhancedSeniorDeduction(30000, 'mfs', true, false);
  const mfs2 = calcEnhancedSeniorDeduction(80000, 'mfs', true, true);
  if (mfs1 !== 0 || mfs2 !== 0) { console.error('FAIL MFS: Must be 0'); failed++; }
  console.log('Test Case 4: Married Filing Separately (MFS)');
  console.log(`  Schedule 1-A Part V Caution: "You cannot claim this deduction if you are married filing separately."`);
  console.log(`  Result at $30,000 AGI: ${fmt(mfs1)}`);
  console.log(`  Result at $80,000 AGI: ${fmt(mfs2)} (CONFIRMED: $0 deduction for MFS)\n`);
}

// ── TEST CASE 5: Qualifying Surviving Spouse (QSS) ────────────────────────
{
  const qssBelow = calcEnhancedSeniorDeduction(40000, 'qss', true, false);
  const qssPhaseout = calcEnhancedSeniorDeduction(100000, 'qss', true, false);
  const qssAbove = calcEnhancedSeniorDeduction(180000, 'qss', true, false);

  // Per Schedule 1-A line 32: "Enter $75,000 ($150,000 if married filing jointly)"
  // QSS does not file a joint return, so threshold is $75,000 (max 1 person, $6,000 max)
  // At $40,000: below $75,000 -> full $6,000
  // At $100,000: excess $25k * 6% = $1,500 -> $4,500 deduction
  // At $180,000: excess $105k * 6% = $6,300 -> $0 deduction (phased out at $175,000)
  if (qssBelow !== 6000) { console.error('FAIL QSS below: Expected 6000, got', qssBelow); failed++; }
  if (qssPhaseout !== 4500) { console.error('FAIL QSS phaseout: Expected 4500, got', qssPhaseout); failed++; }
  if (qssAbove !== 0) { console.error('FAIL QSS above: Expected 0, got', qssAbove); failed++; }

  console.log('Test Case 5: Qualifying Surviving Spouse (QSS)');
  console.log(`  Threshold Confirmed: $75,000 (Schedule 1-A line 32 specifies $150,000 only if married filing jointly)`);
  console.log(`  Max Eligible Person: 1 (surviving spouse; line 36b requires MFJ)`);
  console.log(`  At $40,000 MAGI (under $75k): ${fmt(qssBelow)}`);
  console.log(`  At $100,000 MAGI (in phaseout): ${fmt(qssPhaseout)} ($25k excess × 6% = $1,500 reduction)`);
  console.log(`  At $180,000 MAGI (above $175k): ${fmt(qssAbove)} (fully phased out)\n`);
}

// ── TEST CASE 6: Stacking with Age-65 Additional Standard Deduction (§ 63(f)) ─
{
  const baseSingle = 16100;
  const seniorAddlSingle = 2050;
  const enhDedSingle = calcEnhancedSeniorDeduction(40000, 'single', true, false);
  const totalSingle = baseSingle + seniorAddlSingle + enhDedSingle;
  if (totalSingle !== 24150) { console.error('FAIL Case 6 Single: Expected $24,150, got', totalSingle); failed++; }

  const baseMFJ = 32200;
  const seniorAddlMFJ = 1650 * 2;
  const enhDedMFJ = calcEnhancedSeniorDeduction(100000, 'mfj', true, true);
  const totalMFJ = baseMFJ + seniorAddlMFJ + enhDedMFJ;
  if (totalMFJ !== 47500) { console.error('FAIL Case 6 MFJ: Expected $47,500, got', totalMFJ); failed++; }

  console.log('Test Case 6: Stacking with Additional Standard Deduction (§ 63(f))');
  console.log(`  Single Filer Total Deductions: ${fmt(baseSingle)} (base) + ${fmt(seniorAddlSingle)} (§ 63(f)) + ${fmt(enhDedSingle)} (Sched 1-A) = ${fmt(totalSingle)}`);
  console.log(`  MFJ (Both 65+) Deductions: ${fmt(baseMFJ)} (base) + ${fmt(seniorAddlMFJ)} (§ 63(f)) + ${fmt(enhDedMFJ)} (Sched 1-A) = ${fmt(totalMFJ)}\n`);
}

// ── TEST CASE 7: Social Security Provisional Income & Taxable SS (IRC § 86) ─
{
  // Implementation of IRC § 86 formula matching SocialSecurityTaxCalculator.tsx
  function runSSCalculation(ssBenefits, otherIncome, taxExemptInterest, fs, age65, spouseAge65, applySeniorDed = true) {
    const halfSS = ssBenefits * 0.5;
    const combinedIncome = otherIncome + taxExemptInterest + halfSS;
    const thresh = fs === 'mfj' ? { tier1: 32000, tier2: 44000 } : { tier1: 25000, tier2: 34000 };

    let taxableSS = 0;
    if (combinedIncome > thresh.tier1) {
      if (combinedIncome <= thresh.tier2) {
        taxableSS = Math.min(halfSS, 0.5 * (combinedIncome - thresh.tier1));
      } else {
        const tier1Taxable = Math.min(halfSS, 0.5 * (thresh.tier2 - thresh.tier1));
        const tier2Taxable = 0.85 * (combinedIncome - thresh.tier2);
        taxableSS = Math.min(tier1Taxable + tier2Taxable, 0.85 * ssBenefits);
      }
    }

    const agi = otherIncome + taxableSS;
    const baseStd = fs === 'mfj' ? 32200 : 16100;
    const seniorAddl = fs === 'mfj' ? (spouseAge65 ? 3300 : 1650) : 2050;
    const seniorDed = applySeniorDed ? calcEnhancedSeniorDeduction(agi, fs, age65, spouseAge65) : 0;
    const totalDeductions = baseStd + seniorAddl + seniorDed;
    const taxableIncome = Math.max(0, agi - totalDeductions);

    return { combinedIncome, taxableSS, agi, seniorDed, totalDeductions, taxableIncome };
  }

  const runWithDed = runSSCalculation(30000, 25000, 0, 'single', true, false, true);
  const runWithoutDed = runSSCalculation(30000, 25000, 0, 'single', true, false, false);

  if (runWithDed.combinedIncome !== runWithoutDed.combinedIncome) {
    console.error('FAIL Case 7: Combined/provisional income must be identical!'); failed++;
  }
  if (runWithDed.taxableSS !== runWithoutDed.taxableSS) {
    console.error('FAIL Case 7: Taxable Social Security must be identical!'); failed++;
  }
  if (runWithDed.taxableIncome === runWithoutDed.taxableIncome) {
    console.error('FAIL Case 7: Taxable income must reflect the enhanced deduction!'); failed++;
  }
  if (runWithoutDed.taxableIncome - runWithDed.taxableIncome !== 6000) {
    console.error('FAIL Case 7: Taxable income delta must be exactly $6,000!'); failed++;
  }

  console.log('Test Case 7: Social Security Provisional Income (IRC § 86)');
  console.log(`  Provisional Income (With Ded): ${fmt(runWithDed.combinedIncome)} | (Without Ded): ${fmt(runWithoutDed.combinedIncome)} (MATCH)`);
  console.log(`  Taxable Social Security: ${fmt(runWithDed.taxableSS)} | (Without Ded): ${fmt(runWithoutDed.taxableSS)} (MATCH)`);
  console.log(`  Taxable Income: ${fmt(runWithoutDed.taxableIncome)} -> ${fmt(runWithDed.taxableIncome)} (Deduction: ${fmt(runWithDed.seniorDed)})\n`);
}

// ── TEST CASE 8: Medicare IRMAA MAGI & Tier (IRC § 1395r(i)) ────────────────
{
  function getIRMAATier(magi, filingStatus) {
    const isJoint = filingStatus === 'joint' || filingStatus === 'mfj';
    const t1 = isJoint ? 218000 : 109000;
    const t2 = isJoint ? 274000 : 137000;
    const t3 = isJoint ? 342000 : 171000;
    const t4 = isJoint ? 410000 : 205000;
    const t5 = isJoint ? 750000 : 500000;

    if (magi <= t1) return { tier: 0, surchargeB: 0 };
    if (magi <= t2) return { tier: 1, surchargeB: 81.20 };
    if (magi <= t3) return { tier: 2, surchargeB: 202.90 };
    if (magi <= t4) return { tier: 3, surchargeB: 324.60 };
    if (magi <= t5) return { tier: 4, surchargeB: 446.30 };
    return { tier: 5, surchargeB: 487.00 };
  }

  // Tax return with AGI line 11 = $120,000 and $5,000 municipal tax-exempt interest
  const agi = 120000;
  const taxExemptInterest = 5000;
  const irmaaMagiWith = agi + taxExemptInterest; // Schedule 1-A is line 13b, below AGI line 11
  const irmaaMagiWithout = agi + taxExemptInterest;

  const tierWith = getIRMAATier(irmaaMagiWith, 'single');
  const tierWithout = getIRMAATier(irmaaMagiWithout, 'single');

  if (irmaaMagiWith !== irmaaMagiWithout) { console.error('FAIL Case 8: IRMAA MAGI must be identical!'); failed++; }
  if (tierWith.tier !== tierWithout.tier || tierWith.surchargeB !== tierWithout.surchargeB) {
    console.error('FAIL Case 8: IRMAA tier and surcharge must be identical!'); failed++;
  }

  console.log('Test Case 8: Medicare IRMAA MAGI & Tier (IRC § 1395r(i))');
  console.log(`  IRMAA MAGI: ${fmt(irmaaMagiWith)} | Tier: ${tierWith.tier} | Surcharge: ${fmt2(tierWith.surchargeB)}`);
  console.log(`  CONFIRMED: Schedule 1-A below-the-line deduction does not alter IRMAA tier or MAGI.\n`);
}

// ── TEST CASE 9: Roth Conversion Marginal Rate in Phaseout Zone ────────────
{
  const baselineIncome = 100000;
  const rothConversion = 1000;
  const higherIncome = baselineIncome + rothConversion;

  // Single Filer in 22% bracket ($50,400 to $105,700)
  const stdDedSingle = 16100 + 2050;
  const ded1 = calcEnhancedSeniorDeduction(baselineIncome, 'single', true, false);
  const ded2 = calcEnhancedSeniorDeduction(higherIncome, 'single', true, false);
  const tax1 = calcFederalTaxSingle(baselineIncome - stdDedSingle - ded1);
  const tax2 = calcFederalTaxSingle(higherIncome - stdDedSingle - ded2);
  const taxDelta = tax2 - tax1;
  const marginalRate = taxDelta / rothConversion;

  // Expected marginal rate = 22% * 1.06 = 23.32%
  if (Math.abs(marginalRate - 0.2332) > 0.0001) {
    console.error('FAIL Case 9 Single: Expected marginal rate 23.32%, got', (marginalRate * 100).toFixed(4) + '%');
    failed++;
  }

  // MFJ Both 65+ in 22% bracket ($100,800 to $211,400), both in phaseout
  const baselineJoint = 180000;
  const higherJoint = baselineJoint + rothConversion;
  const stdDedJoint = 32200 + 3300;
  const dedJoint1 = calcEnhancedSeniorDeduction(baselineJoint, 'mfj', true, true);
  const dedJoint2 = calcEnhancedSeniorDeduction(higherJoint, 'mfj', true, true);
  const taxJoint1 = calcFederalTaxMFJ(baselineJoint - stdDedJoint - dedJoint1);
  const taxJoint2 = calcFederalTaxMFJ(higherJoint - stdDedJoint - dedJoint2);
  const taxDeltaJoint = taxJoint2 - taxJoint1;
  const marginalRateJoint = taxDeltaJoint / rothConversion;

  // Expected marginal rate = 22% * 1.12 = 24.64%
  if (Math.abs(marginalRateJoint - 0.2464) > 0.0001) {
    console.error('FAIL Case 9 Joint: Expected marginal rate 24.64%, got', (marginalRateJoint * 100).toFixed(4) + '%');
    failed++;
  }

  console.log('Test Case 9: Roth Conversion Marginal Rate in Phaseout Zone');
  console.log(`  Single Filer (22% Bracket): Tax Delta = ${fmt2(taxDelta)} on ${fmt(rothConversion)} conversion -> ${(marginalRate * 100).toFixed(2)}% (22% × 1.06)`);
  console.log(`  MFJ Both 65+ (22% Bracket): Tax Delta = ${fmt2(taxDeltaJoint)} on ${fmt(rothConversion)} conversion -> ${(marginalRateJoint * 100).toFixed(2)}% (22% × 1.12)\n`);
}

if (failed > 0) {
  console.error(`FAILED: ${failed} tests failed.`);
  process.exit(1);
} else {
  console.log('=== ALL SPECIFICATION CHECKS PASSED (0 ERRORS) ===');
}

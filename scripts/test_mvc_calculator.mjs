/**
 * test_mvc_calculator.mjs
 * Tests for the Medicare vs Medicaid Calculator engine functions.
 * Run: node --experimental-strip-types --no-warnings scripts/test_mvc_calculator.mjs
 *
 * Expected: all vectors PASS with 0 failures.
 * Hand-calculated values per spec §8 and plan document.
 */
import {
  mspCountableIncome,
  classifyMsp,
  snfCoinsurance,
  hospitalCostOnePeriod,
  partAPremiumMonthly,
  partBMonthlyWithIrmaa,
  mvcCalculate,
  MEDICARE_2026,
  SSI_2026,
  extraHelpEligible,
  screenFullMedicaid,
  lisLimits2026,
} from '../src/lib/engine.ts';

let passed = 0, failed = 0;

function check(label, got, expected, tolerance = 0) {
  const ok = Math.abs(Number(got) - Number(expected)) <= tolerance;
  if (ok) { console.log('  PASS', label, '=', got); passed++; }
  else     { console.log('  FAIL', label, '— got', got, '— expected', expected); failed++; }
}
function checkStr(label, got, expected) {
  const ok = got === expected;
  if (ok) { console.log('  PASS', label, '=', got); passed++; }
  else     { console.log('  FAIL', label, '— got', got, '— expected', expected); failed++; }
}

// ── Helper: build a minimal single-person MSP input ──
function mspInput(monthlyIncome, resources = 0, earned = 0, region = 'standard') {
  return {
    age: 70, householdStatus: 'single', resources,
    income: { socialSecurity: monthlyIncome, pension: 0, wages: earned, otherUnearned: 0 },
    workQuarters: 40, annualPartBCharges: 2000, hospitalStays: 0, hospitalDays: 0, snfDays: 0,
    livingSituation: 'home', region,
  };
}
function mspInputCouple(monthlyIncome, resources = 0) {
  return {
    age: 70, householdStatus: 'married_together', resources,
    income: { socialSecurity: monthlyIncome, pension: 0, wages: 0, otherUnearned: 0 },
    spouseIncome: { socialSecurity: 0, pension: 0, wages: 0, otherUnearned: 0 },
    workQuarters: 40, annualPartBCharges: 2000, hospitalStays: 0, hospitalDays: 0, snfDays: 0,
    livingSituation: 'home', region: 'standard',
  };
}

// ────────────────────────────────────────────────────
console.log('\n=== 1. Part A Premium ===');
check('40 quarters → $0/mo', partAPremiumMonthly(40), 0);
check('39 quarters → $311/mo', partAPremiumMonthly(39), 311);
check('30 quarters → $311/mo', partAPremiumMonthly(30), 311);
check('29 quarters → $565/mo', partAPremiumMonthly(29), 565);
check('0 quarters → $565/mo', partAPremiumMonthly(0), 565);

// ────────────────────────────────────────────────────
console.log('\n=== 2. MSP Income Exclusion (countableIncome) ===');
// Income $1,350 SS (all unearned) → $20 exclusion → countable = $1,330
check('SS $1350 → countable $1330', mspCountableIncome({socialSecurity:1350,pension:0,wages:0,otherUnearned:0}), 1330);
// Income $1,000 SS + $100 earned wages → unearned: 1000-20=980; earned: (100-65)/2=17.5 → 997.5
check('SS $1000 + wages $100 → countable $997.50', mspCountableIncome({socialSecurity:1000,pension:0,wages:100,otherUnearned:0}), 997.5);
// Zero income
check('Zero income → countable $0', mspCountableIncome({socialSecurity:0,pension:0,wages:0,otherUnearned:0}), 0);
// Only earned $200: no unearned, $20 remainder goes to earned. earned after excl: (200-65-20)/2=57.5
check('Wages only $200 → countable $57.50', mspCountableIncome({socialSecurity:0,pension:0,wages:200,otherUnearned:0}), 57.5);

// ────────────────────────────────────────────────────
console.log('\n=== 3. MSP Boundaries — Single (spec §8) ===');
// QMB limit = $1,350 (single). countableIncome = SS - 20 = limit means SS = 1370
// Test countableIncome directly via mspInput

const tier = (income, resources = 0) => classifyMsp(mspInput(income + 20, resources)).tier;
// income + 20 SS → countableIncome = income (after $20 exclusion)

checkStr('$1,350 countable → QMB', tier(1350), 'QMB');
checkStr('$1,351 countable → SLMB', tier(1351), 'SLMB');
checkStr('$1,616 countable → SLMB', tier(1616), 'SLMB');
checkStr('$1,617 countable → QI', tier(1617), 'QI');
checkStr('$1,816 countable → QI', tier(1816), 'QI');
checkStr('$1,817 countable → none', tier(1817), 'none');

// Resource tests
checkStr('Resources $9,950 → QMB (income $0)', classifyMsp(mspInput(20, 9950)).tier, 'QMB');
checkStr('Resources $9,951 → none (income $0)', classifyMsp(mspInput(20, 9951)).tier, 'none');

// ────────────────────────────────────────────────────
console.log('\n=== 4. MSP Boundaries — Couple (spec §8) ===');
// Couple QMB limit = $1,824, SLMB = $2,184, QI = $2,455
// SS + 20 → countable = SS, so set SS = limit
const tierC = (income, resources = 0) => classifyMsp(mspInputCouple(income + 20, resources)).tier;

checkStr('Couple $1,824 → QMB', tierC(1824), 'QMB');
checkStr('Couple $1,825 → SLMB', tierC(1825), 'SLMB');
checkStr('Couple $2,184 → SLMB', tierC(2184), 'SLMB');
checkStr('Couple $2,185 → QI', tierC(2185), 'QI');
checkStr('Couple $2,455 → QI', tierC(2455), 'QI');
checkStr('Couple $2,456 → none', tierC(2456), 'none');

// Couple resource test
checkStr('Couple resources $14,910 → QMB', classifyMsp(mspInputCouple(20, 14910)).tier, 'QMB');
checkStr('Couple resources $14,911 → none', classifyMsp(mspInputCouple(20, 14911)).tier, 'none');

// ────────────────────────────────────────────────────
console.log('\n=== 5. Medicare Cost Examples (spec §8) ===');
// Part B $2,000 charges, single, no MSP, 40 quarters (Part A free), no hospital, no SNF
const inp2k = {
  age:70, householdStatus:'single', resources:0,
  income:{socialSecurity:1000,pension:0,wages:0,otherUnearned:0},
  workQuarters:40, annualPartBCharges:2000, hospitalStays:0, hospitalDays:0, snfDays:0,
  livingSituation:'home', region:'standard',
};
const r2k = mvcCalculate(inp2k);
// Expected: 12 × $202.90 + $283 + 20% × (2000-283) = $2,434.80 + $283 + $343.40 = $3,061.20
check('Part B $2k — Medicare only cost $3,061.20', r2k.costs.medicareOnlyCost, 3061.20, 0.01);
check('Part B $2k — with QMB $0', r2k.costs.withQmbCost, 0);
// With SLMB: Part B premium paid; rest: $283 + $343.40 = $626.40
check('Part B $2k — with SLMB $626.40', r2k.costs.withSlmbCost, 626.40, 0.01);

// Hospital 70 days (1 stay): deductible $1,736 + 10×$434 = $1,736 + $4,340 = $6,076
check('hospitalCostOnePeriod(70) = $6,076', hospitalCostOnePeriod(70), 6076);
check('hospitalCostOnePeriod(60) = $1,736 (deductible only)', hospitalCostOnePeriod(60), 1736);
check('hospitalCostOnePeriod(0) = $0', hospitalCostOnePeriod(0), 0);

// SNF 30 days: 10 days × $217 = $2,170
check('snfCoinsurance(30) = $2,170', snfCoinsurance(30), 2170);
// SNF 100 days: 80 × $217 = $17,360
check('snfCoinsurance(100) = $17,360', snfCoinsurance(100), 17360);
// SNF 20 days: $0
check('snfCoinsurance(20) = $0', snfCoinsurance(20), 0);
// SNF 1 day: $0
check('snfCoinsurance(1) = $0', snfCoinsurance(1), 0);

// ────────────────────────────────────────────────────
console.log('\n=== 6. IRMAA Part B Premium ===');
check('MAGI $50k single → $202.90', partBMonthlyWithIrmaa(50000, 'single'), 202.90);
check('MAGI $109k single → $202.90', partBMonthlyWithIrmaa(109000, 'single'), 202.90);
check('MAGI $110k single → $284.10', partBMonthlyWithIrmaa(110000, 'single'), 284.10);
check('MAGI $137k single → $284.10', partBMonthlyWithIrmaa(137000, 'single'), 284.10);
check('MAGI $138k single → $405.80', partBMonthlyWithIrmaa(138000, 'single'), 405.80);
check('MAGI $500k single → $689.90', partBMonthlyWithIrmaa(500000, 'single'), 689.90);
check('MAGI $220k MFJ → $284.10', partBMonthlyWithIrmaa(220000, 'mfj'), 284.10);

// ────────────────────────────────────────────────────
console.log('\n=== 7. Extra Help ===');
const lisS = lisLimits2026(1);
const lisC = lisLimits2026(2);
check('LIS single income limit $1,995/mo', lisS.incomeMonthly, 1995);
check('LIS couple income limit $2,705/mo', lisC.incomeMonthly, 2705);
check('LIS single resources $16,590', lisS.resources, 16590);
check('LIS single resources+burial $18,090', lisS.resourcesWithBurial, 18090);
check('LIS couple resources $33,100', lisC.resources, 33100);

// ────────────────────────────────────────────────────
console.log('\n=== 8. Full Medicaid Screen ===');
// Income $800 (below $994 limit), resources $1,000 (below $2,000) → likely true
const fmYes = screenFullMedicaid({...inp2k, income:{socialSecurity:800,pension:0,wages:0,otherUnearned:0}, resources:1000});
check('FM: income $780 countable, resources $1k → likely', fmYes.likely ? 1 : 0, 1);

// Income $1,000 SS → countable $980 < $994 → likely
const fmBorderline = screenFullMedicaid({...inp2k, income:{socialSecurity:1014,pension:0,wages:0,otherUnearned:0}, resources:1000});
// countable = 1014-20=994 = exactly the limit → likely
check('FM: countable exactly $994 → likely', fmBorderline.likely ? 1 : 0, 1);

// Income $2,000 SS → countable $1,980 > $994 → not likely (community)
const fmNo = screenFullMedicaid({...inp2k, income:{socialSecurity:2000,pension:0,wages:0,otherUnearned:0}, resources:1000});
check('FM: income $1,980 countable > $994 limit → not likely', fmNo.likely ? 0 : 1, 1);

// Nursing facility: income $2,500 SS → countable $2,480 < $2,982 → likely
const fmNH = screenFullMedicaid({...inp2k, livingSituation:'nursing_facility',
  income:{socialSecurity:2500,pension:0,wages:0,otherUnearned:0}, resources:999999});
check('FM: nursing facility income $2,480 countable < $2,982 → likely', fmNH.likely ? 1 : 0, 1);

// Nursing facility: income $3,100 SS → countable $3,080 > $2,982 → not likely
const fmNHno = screenFullMedicaid({...inp2k, livingSituation:'nursing_facility',
  income:{socialSecurity:3100,pension:0,wages:0,otherUnearned:0}, resources:999999});
check('FM: nursing facility income $3,080 countable > $2,982 → not likely', fmNHno.likely ? 0 : 1, 1);

// ────────────────────────────────────────────────────
console.log('\n=== 9. Medicare Constants Cross-Check ===');
check('Part A deductible = $1,736', MEDICARE_2026.partADeductible, 1736);
check('Part A coin 61-90 = $434', MEDICARE_2026.partACoin6190, 434);
check('Part A lifetime reserve = $868', MEDICARE_2026.partALifetimeReserve, 868);
check('SNF days 21-100 = $217', MEDICARE_2026.snfCoin2190, 217);
check('Part A premium 30-39 qtrs = $311', MEDICARE_2026.partAPremium3039, 311);
check('Part A premium <30 qtrs = $565', MEDICARE_2026.partAPremiumUnder30, 565);
check('Part B premium = $202.90', MEDICARE_2026.partBPremium, 202.90);
check('Part B deductible = $283', MEDICARE_2026.partBDeductible, 283);
check('Part D base premium = $38.99', MEDICARE_2026.partDBasePremium, 38.99);
check('Part D deductible = $615', MEDICARE_2026.partDDeductible, 615);
check('Part D OOP cap = $2,100', MEDICARE_2026.partDOopCap, 2100);

// ────────────────────────────────────────────────────
console.log('\n=== 10. SSI 2026 Constants (UNVERIFIED — computed) ===');
check('SSI individual 2026 = $994 (COMPUTED)', SSI_2026.individual, 994);
check('SSI couple 2026 = $1,491 (VERIFIED via COLA constants)', SSI_2026.couple, 1491);
check('SSI special income level = $2,982 (COMPUTED = 300% × $994)', SSI_2026.specialIncomeLevel, 2982);

// ────────────────────────────────────────────────────
console.log('\n=== 11. Dual Status Classification ===');
// Person with income $800 SS, resources $1k, age 70, 40 quarters → full dual (QMB + full Medicaid)
const dualResult = mvcCalculate({...inp2k, income:{socialSecurity:800,pension:0,wages:0,otherUnearned:0}, resources:1000});
checkStr('Income $780 countable → full_dual', dualResult.dualStatus, 'full_dual');
check('full_dual → medicareEligible', dualResult.medicareEligible ? 1:0, 1);
check('full_dual → QMB tier', dualResult.msp.tier === 'QMB' ? 1:0, 1);
check('full_dual → extraHelpDeemed', dualResult.extraHelpDeemed ? 1:0, 1);
check('full_dual → fullMedicaidLikely', dualResult.fullMedicaidLikely ? 1:0, 1);

// Person with income $2,000 SS (countable $1,980), age 70, 40 qtrs → SLMB only (above SSI limit, income ≤ SLMB)
const slmbResult = mvcCalculate({...inp2k, income:{socialSecurity:2000,pension:0,wages:0,otherUnearned:0}, resources:1000});
// countable = 1980; SLMB=1616, QI=1816; 1980 > QI limit (1816) → tier = none... wait 1980 > 1816, so 'none'
// Actually SLMB is for income between 1350 and 1616. 1980 is > 1816 → 'none'
checkStr('Income $1,980 countable → tier none (above QI $1,816)', slmbResult.msp.tier, 'none');

// Person countable $1,400 (SS $1,420): between QMB ($1,350) and SLMB ($1,616) → SLMB
const slmbR2 = mvcCalculate({...inp2k, income:{socialSecurity:1420,pension:0,wages:0,otherUnearned:0}, resources:1000});
// countable = 1420 - 20 = 1400 → > QMB(1350), ≤ SLMB(1616) → SLMB
checkStr('Countable $1,400 → SLMB', slmbR2.msp.tier, 'SLMB');
checkStr('SLMB → dualStatus slmb_only (not full Medicaid)', slmbR2.dualStatus, 'slmb_only');

// Person under 65, no SSDI, no ESRD → not Medicare eligible
const notMedicare = mvcCalculate({...inp2k, age:62});
check('Age 62, no SSDI → not Medicare eligible', notMedicare.medicareEligible ? 0:1, 1);
checkStr('Age 62 → dualStatus medicaid_only (no Medicare but countable income < SSI limit)', notMedicare.dualStatus, 'medicaid_only');

// SSDI 24 months, age 50 → Medicare eligible
const ssdi24 = mvcCalculate({...inp2k, age:50, ssdiMonths:24});
check('Age 50 + SSDI 24mo → Medicare eligible', ssdi24.medicareEligible ? 1:0, 1);

// ────────────────────────────────────────────────────
console.log('\n=== 12. MSP Limit Assert = Medicare.gov Published Table ===');
// Assert that engine-computed limits match the published official Medicare.gov table
import { mspMonthlyLimits } from '../src/lib/engine.ts';
const lim1 = mspMonthlyLimits(1);
const lim2 = mspMonthlyLimits(2);
check('QMB single = $1,350 (Medicare.gov)', lim1.qmb, 1350);
check('SLMB single = $1,616 (Medicare.gov)', lim1.slmb, 1616);
check('QI single = $1,816 (Medicare.gov)', lim1.qi, 1816);
check('QMB couple = $1,824 (formula)', lim2.qmb, 1824);
check('SLMB couple = $2,184 (formula)', lim2.slmb, 2184);
check('QI couple = $2,455 (formula)', lim2.qi, 2455);
check('Resources single = $9,950', lim1.resources, 9950);
check('Resources couple = $14,910', lim2.resources, 14910);

// ────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════');
console.log('TOTAL:', passed + failed, '| PASSED:', passed, '| FAILED:', failed);
if (failed === 0) console.log('ALL MVC CALCULATOR TEST VECTORS PASSED');
else              console.log('FAILURES DETECTED — fix before committing');
console.log('═══════════════════════════════════════════\n');
if (failed > 0) process.exit(1);

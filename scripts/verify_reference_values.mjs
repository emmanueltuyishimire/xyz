// scripts/verify_reference_values.mjs
// Calls the site's REAL engine functions and compares with values recomputed from official formulas.
// Run: node --experimental-strip-types --no-warnings scripts/verify_reference_values.mjs
import fs from 'fs'; import os from 'os'; import path from 'path'; import { pathToFileURL } from 'url';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sa-lib-'));
for (const f of fs.readdirSync('src/lib')) {
  let s = fs.readFileSync(path.join('src/lib', f), 'utf8');
  s = s.replace(/from '\.\/constants-2026'/g, "from './constants-2026.ts'")
       .replace(/from '\.\/constants-2026\.json'(?!\s+with)/g, "from './constants-2026.json' with { type: 'json' }")
       .replace(/from '\.\/(engine|constants-2026)'/g, "from './$1.ts'");
  fs.writeFileSync(path.join(tmp, f), s);
}
const eng = await import(pathToFileURL(path.join(tmp, 'engine.ts')).href);

let fail = 0;
const eq = (name, got, want, tol = 0.005) => {
  const ok = Math.abs(got - want) <= tol;
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: got ${got}, official-formula value ${want}`);
};
// Senior deduction - IRS Schedule 1-A Part V lines 31-37: per person = max(0, 6000 - 0.06*excess); total = per person x qualifying people
eq('senior ded MFJ x2 MAGI 150,000', eng.seniorDeduction(150000, 'mfj', 2), 12000);
eq('senior ded MFJ x2 MAGI 200,000', eng.seniorDeduction(200000, 'mfj', 2), 6000);
eq('senior ded MFJ x2 MAGI 250,000', eng.seniorDeduction(250000, 'mfj', 2), 0);
eq('senior ded MFJ x1 MAGI 200,000', eng.seniorDeduction(200000, 'mfj', 1), 3000);
eq('senior ded single MAGI 100,000', eng.seniorDeduction(100000, 'single', 1), 4500);
eq('senior ded single MAGI 175,000', eng.seniorDeduction(175000, 'single', 1), 0);
eq('senior ded MFS', eng.seniorDeduction(50000, 'mfs', 1), 0);
// Pub 915 taxable Social Security
eq('SS taxable single 24,000 + 30,000', eng.taxableSS({ ss: 24000, otherAGI: 30000, status: 'single' }).taxableSS, 11300);
eq('SS taxable mfj 46,000 + 35,000', eng.taxableSS({ ss: 46000, otherAGI: 35000, status: 'mfj' }).taxableSS, 17900);
eq('SS taxable single 22,000 + 20,000', eng.taxableSS({ ss: 22000, otherAGI: 20000, status: 'single' }).taxableSS, 3000);
eq('SS taxable below base (single 10,000 + 10,000)', eng.taxableSS({ ss: 10000, otherAGI: 10000, status: 'single' }).taxableSS, 0);
eq('SS taxable mfs lived together', eng.taxableSS({ ss: 20000, otherAGI: 10000, status: 'mfs', livedWithSpouse: true }).taxableSS, 17000); // 85% cap
// Medicare Savings Programs 2026 - Medicare.gov table (monthly income limit, individual / couple)
const msp1 = eng.mspMonthlyLimits(1), msp2 = eng.mspMonthlyLimits(2);
eq('MSP QMB single', msp1.qmb, 1350, 0); eq('MSP QMB couple', msp2.qmb, 1824, 0);
eq('MSP SLMB single', msp1.slmb, 1616, 0); eq('MSP SLMB couple', msp2.slmb, 2184, 0);
eq('MSP QI single', msp1.qi, 1816, 0); eq('MSP QI couple', msp2.qi, 2455, 0);
eq('MSP resources single', msp1.resources, 9950, 0); eq('MSP resources couple', msp2.resources, 14910, 0);
// HHS poverty guidelines 2026
eq('FPL 2026 single', eng.fplAnnual2026(1), 15960, 0); eq('FPL 2026 couple', eng.fplAnnual2026(2), 21640, 0);
eq('FPL 2026 Alaska single', eng.fplAnnual2026(1, 'AK'), 19950, 0); eq('FPL 2026 Hawaii single', eng.fplAnnual2026(1, 'HI'), 18360, 0);
// Extra Help 2026 - CMS CY2026 LIS memo (resources) and 150% FPL (income)
const lis1 = eng.lisLimits2026(1), lis2 = eng.lisLimits2026(2);
eq('LIS income single /mo', lis1.incomeMonthly, 1995); eq('LIS income couple /mo', lis2.incomeMonthly, 2705);
eq('LIS resources single', lis1.resources, 16590, 0); eq('LIS resources couple', lis2.resources, 33100, 0);
eq('LIS resources single w/ burial', lis1.resourcesWithBurial, 18090, 0); eq('LIS resources couple w/ burial', lis2.resourcesWithBurial, 36100, 0);
// SNAP FY2027 - USDA FNS COLA page (effective 2026-10-01)
eq('SNAP net limit 1', eng.snapNetLimitFY2027(1), 1330, 0); eq('SNAP net limit 2', eng.snapNetLimitFY2027(2), 1804, 0);
eq('SNAP std deduction 1-3', eng.snapStandardDeductionFY2027(2), 217, 0); eq('SNAP std deduction 4', eng.snapStandardDeductionFY2027(4), 229, 0);
eq('SNAP std deduction 5', eng.snapStandardDeductionFY2027(5), 268, 0); eq('SNAP std deduction 6+', eng.snapStandardDeductionFY2027(7), 308, 0);
console.log(fail === 0 ? 'ALL ENGINE REFERENCE VALUES PASS' : `${fail} ENGINE REFERENCE VALUE(S) FAIL`);
process.exit(fail ? 1 : 0);

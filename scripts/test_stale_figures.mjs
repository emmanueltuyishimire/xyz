// scripts/test_stale_figures.mjs  - site-wide guard against stale or wrong official figures.
// Run: node scripts/test_stale_figures.mjs   (exit code 1 on any hit)
import fs from 'fs';
import path from 'path';

const ROOT = 'src';
const EXT = ['.md', '.astro', '.tsx', '.ts', '.json'];
// [label, regex, why-it-is-wrong -> right, allowedFiles (substring match on path)]
const STALE = [
  ['PARTD_DEDUCTIBLE_590', /\$590\b/, '2026 Part D max deductible is $615 (CMS)', ['what-is-medicare-part-d.md', 'medicare-donut-hole-calculator.astro']], // labelled 2025 column / history table
  ['LIS_RES_2024', /\b17,220\b|\b34,360\b|\b18,720\b|\b37,360\b/, '2026 LIS resources: $16,590/$33,100 ($18,090/$36,100 with burial)', []],
  ['LIS_INCOME_OLD', /\b1,985\b|\b2,685\b|\b23,820\b|\b32,220\b/, '2026 LIS income: 150% FPL = $23,940/yr single ($1,995/mo), $32,460 couple ($2,705/mo)', []],
  ['LIS_COPAY_2025', /\$12\.15\b|\$4\.90[^.\n<]{0,25}generic|generic[^.\n<]{0,45}\$4\.90|Max \$4\.90/i, '2026 LIS copays: $5.10 generic / $12.65 brand ($1.60 / $4.90 only if full-benefit dual at or below 100% FPL)', []],
  ['LIS_SAVINGS_UNSOURCED', /\$5,900/, 'No official source: remove the figure', []],
  ['LIS_OLD_DRUGEST', /\$23,000 single|\$31,000 joint/, 'Use 150% FPL 2026 figures', []],
  ['MSP_FPL_2024', /\$1,255\b|\$1,703\b|\$15,060\b|\$20,440\b|\$1,379\b|\$1,660\b|\$1,867\b|\$1,153\b|\$1,692\b|\$1,506\b|\$1,694\b|\$1,548\b|\$2,510\b|\+\$448\b|fplBase = 1255|fplExtra = 448|return 1255|return 1703|1703 \+ \(size/, 'Use 2026 FPL $15,960 (+$5,680): MSP monthly limits QMB $1,350/$1,824, SLMB $1,616/$2,184, QI $1,816/$2,455 (SNAP: see SNAP_FY2025 rule)', []],
  ['MSP_ASSET_OLD', /\$10,930\b|\$9,900\b|\$14,850\b|\$9,430\b|\$14,130\b/, '2026 MSP resource limits: $9,950 individual / $14,910 couple (Medicare.gov)', []],
  ['SNAP_FY2025_VALUES', /\$204(?![.\d,])|\b198 : \(size|\[0, 292, 536/, 'SNAP FY2027 (from 2026-10-01): standard deduction $217 (1-3), $229, $268, $308; net limit $1,330 / $1,804', []],
  ['PARTD_NBBP_STALE', /36\.78|\$5\.149|\$11\.034|\$11\.00 per month|adding \$5\.10 each month|rounds to \$5\.10/, 'Part D examples must use $38.99 -> $5.50 (14 mo) and $11.70 (30 mo)', []],
  ['PARTD_CAP_2000', /(out-of-pocket|annual (Part D|drug)|drug cap|capped at|cap (of|at))[^.\n<]{0,40}\$2,000\b|\$2,000[^.\n<]{0,30}(out-of-pocket cap|annual (drug )?cap|Drug Out-of-Pocket Cap|Part D out-of-pocket)/i, '2026 Part D OOP cap is $2,100 (CMS); $2,000 was 2025', ['what-is-medicare-part-d.md', 'medicare-donut-hole-calculator.astro']],
  ['FRA_OLD_CHART', /140\.0% of PIA|138\.7% of PIA|137\.3% of PIA|136\.0% of PIA|134\.7% of PIA|133\.3% of PIA/, 'FRA age-70 values for 1937-1942: 132.5/131.4/132.7/131.5/132.5/131.3', []],
  ['SSA_DEAD_URL', /colafacts2026\.(pdf|htm)/, 'Use https://www.ssa.gov/news/en/cola/factsheets/2026.html', []],
];
// Strings that MUST exist in a file (proves a code fix is present).
const MUST_CONTAIN = [
  ['src/lib/engine.ts', 'const perPerson = Math.max(0, config.amountPerPerson'],
  ['scripts/test_phase_a.mjs', 'const perPerson = Math.max(0, config.amountPerPerson'],
  ['src/components/tools/SocialSecuritySpousalBenefitCalculator.tsx', 'Math.max(0, maxSpousalBenefit - spousePia) * spousalFactor'],
  ['src/components/tools/SocialSecuritySurvivorBenefitCalculator.tsx', '(0.285 / 84)'],
  ['src/components/tools/FRACalculatorDynamic.tsx', 'benefitAt70Pct: 131.4'],
  ['src/lib/constants-2026.json', '"hhsPoverty2026"'],
  ['src/lib/constants-2026.json', '"lis2026"'],
  ['src/lib/constants-2026.json', '"msp2026"'],
  ['src/lib/constants-2026.json', '"snapFY2027"'],
  ['src/lib/engine.ts', 'export function mspMonthlyLimits'],
  ['src/components/tools/MedicareSavingsEstimator.tsx', 'mspMonthlyLimits('],
  ['src/components/tools/ExtraHelpEligibilityCalculator.tsx', 'lisLimits2026('],
  ['src/lib/snapCalc.ts', 'snapNetLimitFY2027('],
  ['src/lib/partDCost.ts', 'MEDICARE_PART_D_DEDUCTIBLE_2026'],
];
function walk(d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap(e => {
    const p = path.join(d, e.name);
    return e.isDirectory() ? walk(p) : EXT.includes(path.extname(p)) ? [p] : [];
  });
}
let hits = 0;
for (const f of walk(ROOT)) {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const [label, re, why, allow] of STALE) {
      if (allow.some(a => f.includes(a))) continue;
      if (re.test(line)) { hits++; console.log(`STALE ${label}  ${f}:${i + 1}\n   ${line.trim().slice(0, 140)}\n   -> ${why}`); }
    }
  });
}
for (const [f, needle] of MUST_CONTAIN) {
  if (!fs.existsSync(f) || !fs.readFileSync(f, 'utf8').includes(needle)) { hits++; console.log(`MISSING FIX  ${f}  must contain: ${needle}`); }
}
console.log(hits === 0 ? 'PASS: no stale figures, all required fixes present' : `FAIL: ${hits} problem(s)`);
process.exit(hits === 0 ? 1 - 1 : 1);

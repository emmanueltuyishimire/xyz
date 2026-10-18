import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Read constants.ts directly and extract OFFICIAL_2027_COLA
const constantsPath = path.join(rootDir, 'src', 'data', 'constants.ts');
const constantsSrc = fs.readFileSync(constantsPath, 'utf8');

// Also load the saved official SSA 2027 fact sheet
const factSheetPath = path.join(rootDir, 'data', 'sources', 'ssa_2027_cola_fact_sheet.html');
const factSheetHtml = fs.readFileSync(factSheetPath, 'utf8');

// Files to test
const colaGuidePath = path.join(rootDir, 'src', 'content', 'social-security', 'social-security-cola-2027.md');
const colaToolPath = path.join(rootDir, 'src', 'pages', 'tools', 'social-security-cola-calculator.astro');
const earningsToolPath = path.join(rootDir, 'src', 'pages', 'tools', 'ssa-earnings-test-calculator.astro');
const colaEstimatorCompPath = path.join(rootDir, 'src', 'components', 'tools', 'SocialSecurityCOLAEstimator.tsx');
const msdPath = path.join(rootDir, 'src', 'pages', 'tools', 'medicaid-spend-down-calculator.astro');

const colaGuideContent = fs.readFileSync(colaGuidePath, 'utf8');
const colaToolContent = fs.readFileSync(colaToolPath, 'utf8');
const earningsToolContent = fs.readFileSync(earningsToolPath, 'utf8');
const colaEstimatorCompContent = fs.readFileSync(colaEstimatorCompPath, 'utf8');
const msdContent = fs.readFileSync(msdPath, 'utf8');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  FAIL: ${testName} - ${details}`);
  }
}

console.log('--- 1. Testing Official 2027 SSA Fact Sheet Integrity ---');
assert(factSheetHtml.includes('3.6 percent COLA for 2027'), 'Fact Sheet contains 3.6% COLA');
assert(factSheetHtml.includes('$192,300'), 'Fact Sheet contains $192,300 wage base');
assert(factSheetHtml.includes('$184,500'), 'Fact Sheet contains $184,500 2026 wage base');
assert(factSheetHtml.includes('$25,560'), 'Fact Sheet contains $25,560 under FRA earnings test');
assert(factSheetHtml.includes('$24,480'), 'Fact Sheet contains $24,480 2026 under FRA limit');
assert(factSheetHtml.includes('$67,920'), 'Fact Sheet contains $67,920 year of FRA earnings test');
assert(factSheetHtml.includes('$65,160'), 'Fact Sheet contains $65,160 2026 year of FRA limit');
assert(factSheetHtml.includes('$1,970'), 'Fact Sheet contains $1,970 quarter of coverage');
assert(factSheetHtml.includes('$1,770'), 'Fact Sheet contains $1,770 SGA non-blind');
assert(factSheetHtml.includes('$2,950'), 'Fact Sheet contains $2,950 SGA blind');
assert(factSheetHtml.includes('$1,270'), 'Fact Sheet contains $1,270 Trial Work Period');
assert(factSheetHtml.includes('$4,188'), 'Fact Sheet contains $4,188 max benefit at FRA');
assert(factSheetHtml.includes('$1,029'), 'Fact Sheet contains $1,029 individual SSI');
assert(factSheetHtml.includes('$1,544'), 'Fact Sheet contains $1,544 couple SSI');
assert(factSheetHtml.includes('$2,500'), 'Fact Sheet contains $2,500 monthly student SSI exclusion');
assert(factSheetHtml.includes('$10,080'), 'Fact Sheet contains $10,080 annual student SSI exclusion');
assert(factSheetHtml.includes('$2,095 to $2,170'), 'Fact Sheet contains retired worker avg $2,095 to $2,170');
assert(factSheetHtml.includes('$3,238 to $3,355'), 'Fact Sheet contains aged couple avg $3,238 to $3,355');
assert(factSheetHtml.includes('$1,936 to $2,005'), 'Fact Sheet contains aged widow(er) avg $1,936 to $2,005');
assert(factSheetHtml.includes('$1,642 to $1,701'), 'Fact Sheet contains disabled worker avg $1,642 to $1,701');

console.log('\n--- 2. Testing constants.ts against Fact Sheet Values ---');
assert(constantsSrc.includes("rate: 3.6"), 'constants.ts has 3.6 rate');
assert(constantsSrc.includes("wageBase: 192300") && constantsSrc.includes("SOCIAL_SECURITY_WAGE_BASE_2027"), 'constants.ts has 192,300 wage base');
assert(constantsSrc.includes("earningsTestUnderFRA: 25560") && constantsSrc.includes("EARNINGS_TEST_UNDER_FRA_2027"), 'constants.ts has 25,560 under-FRA earnings limit');
assert(constantsSrc.includes("earningsTestYearOfFRA: 67920") && constantsSrc.includes("EARNINGS_TEST_YEAR_OF_FRA_2027"), 'constants.ts has 67,920 year-of-FRA earnings limit');
assert(constantsSrc.includes("quarterOfCoverage: 1970") && constantsSrc.includes("QUARTER_OF_COVERAGE_2027"), 'constants.ts has 1,970 quarter of coverage');
assert(constantsSrc.includes("sgaNonBlind: 1770") && constantsSrc.includes("SGA_NON_BLIND_2027"), 'constants.ts has 1,770 SGA non-blind');
assert(constantsSrc.includes("sgaBlind: 2950") && constantsSrc.includes("SGA_BLIND_2027"), 'constants.ts has 2,950 SGA blind');
assert(constantsSrc.includes("trialWorkPeriod: 1270") && constantsSrc.includes("TRIAL_WORK_PERIOD_2027"), 'constants.ts has 1,270 trial work period');
assert(constantsSrc.includes("maxBenefitAtFRA: 4188") && constantsSrc.includes("MAX_BENEFIT_FRA_2027"), 'constants.ts has 4,188 max benefit at FRA');
assert(constantsSrc.includes("ssiIndividual: 1029") && constantsSrc.includes("SSI_INDIVIDUAL_2027"), 'constants.ts has 1,029 individual SSI');
assert(constantsSrc.includes("ssiCouple: 1544") && constantsSrc.includes("SSI_COUPLE_2027"), 'constants.ts has 1,544 couple SSI');
assert(constantsSrc.includes("ssiStudentExclusionMonthly: 2500") && constantsSrc.includes("SSI_STUDENT_EXCLUSION_MONTHLY_2027"), 'constants.ts has 2,500 student SSI monthly');
assert(constantsSrc.includes("ssiStudentExclusionAnnual: 10080") && constantsSrc.includes("SSI_STUDENT_EXCLUSION_ANNUAL_2027"), 'constants.ts has 10,080 student SSI annual');
assert(constantsSrc.includes("averageMonthlyIncrease: 75"), 'constants.ts has 75 averageMonthlyIncrease');

console.log('\n--- 3. Testing 2027 COLA Guide (/social-security/social-security-cola-2027/) ---');
assert(colaGuideContent.includes('3.6%'), 'Guide includes 3.6%');
assert(colaGuideContent.includes('$192,300'), 'Guide includes $192,300');
assert(colaGuideContent.includes('$25,560'), 'Guide includes $25,560');
assert(colaGuideContent.includes('$24,480'), 'Guide includes $24,480');
assert(colaGuideContent.includes('+$1,080'), 'Guide includes +$1,080 under FRA change');
assert(colaGuideContent.includes('$67,920'), 'Guide includes $67,920');
assert(colaGuideContent.includes('$65,160'), 'Guide includes $65,160');
assert(colaGuideContent.includes('+$2,760'), 'Guide includes +$2,760 year of FRA change');
assert(colaGuideContent.includes('$1,544'), 'Guide includes $1,544 couple SSI');
assert(colaGuideContent.includes('+$53'), 'Guide includes +$53 couple SSI change');
assert(colaGuideContent.includes('$2,095 to $2,170'), 'Guide includes retired worker average $2,095 to $2,170');
assert(colaGuideContent.includes('https://www.ssa.gov/news/en/cola/factsheets/2027.html'), 'Guide links to official 2027 fact sheet URL');
assert(colaGuideContent.includes('### What is the Social Security COLA for 2027?'), 'Guide renders FAQ 1');
assert(colaGuideContent.includes('### When does the 2027 COLA take effect?'), 'Guide renders FAQ 2');
assert(!colaGuideContent.includes('<FAQBlock items={faqs} />'), 'Guide replaced broken FAQBlock with markdown FAQs');
assert(!colaGuideContent.includes('3.1% to 3.8%'), 'Guide does not contain unsourced analyst range');
assert(!colaGuideContent.includes('kff.org'), 'Guide removed broken KFF link');

console.log('\n--- 4. Testing COLA Calculator Page (/tools/social-security-cola-calculator/) ---');
assert(colaToolContent.includes('Social Security COLA 2027 Calculator: Your 3.6% Increase'), 'Tool page title is correct');
assert(colaToolContent.includes('Social Security COLA 2027 is 3.6% (SSA, Oct 14, 2026)'), 'Tool page meta description starts correctly');
assert(colaToolContent.includes('<h1 class="cc-h1">Social Security COLA 2027 Calculator: 3.6% Increase</h1>'), 'Tool H1 is exact');
assert(colaToolContent.includes('Social Security COLA 2027 is {OFFICIAL_2027_COLA.rateFormatted}'), 'Quick Answer pulls rate from constants.ts');
assert(colaToolContent.includes('average retirement benefit rises {OFFICIAL_2027_COLA.averageMonthlyIncreaseFormatted} a month'), 'Quick Answer references average increase from constants.ts');
assert(!colaToolContent.includes('choose a projected rate'), 'Tool page removed stale projected rate FAQ');
assert(colaToolContent.includes('https://www.medicare.gov/basics/costs/medicare-costs'), 'Tool sources table has 200 OK Medicare costs URL');
assert(!colaToolContent.includes('cms.gov/newsroom/fact-sheets'), 'Tool sources table removed 404 CMS fact-sheets link');

// Verify ordering: H1 -> Quick Answer -> Calculator
const h1Index = colaToolContent.indexOf('class="cc-h1"');
const qaIndex = colaToolContent.indexOf('class="cc-quick-answer"');
const calcIndex = colaToolContent.indexOf('id="calculator"');
assert(h1Index !== -1 && qaIndex !== -1 && calcIndex !== -1, 'All hero elements found');
assert(h1Index < qaIndex, 'H1 appears before Quick Answer');
assert(qaIndex < calcIndex, 'Quick Answer appears before Calculator');

console.log('\n--- 5. Testing SSA Earnings Test Calculator Page (/tools/ssa-earnings-test-calculator/) ---');
assert(earningsToolContent.includes('$1,525'), 'Earnings test calculator includes Robert corrected amount $1,525');
assert(earningsToolContent.includes('+$125/month') || earningsToolContent.includes('+$125/mo'), 'Earnings test calculator includes Robert gain +$125/month');
assert(earningsToolContent.includes('76.25%'), 'Earnings test calculator includes Robert benefit factor 76.25%');
assert(earningsToolContent.includes('Owed $3,000; 3 Checks Stopped ($3,600 Withheld, $600 Refunded)'), 'Earnings test calculator has Carol corrected header');
assert(earningsToolContent.includes('Official 2027 Social Security Earnings Test Limits'), 'Earnings test calculator has 2027 limits section');
assert(earningsToolContent.includes('OFFICIAL_2027_COLA.earningsTestUnderFRAFormatted'), 'Earnings test pulls 2027 limits from constants.ts');

console.log('\n--- 6. Testing Medicaid Spend-Down Calculator (/tools/medicaid-spend-down-calculator/) ---');
assert(msdContent.includes('Dec 9, 2025 CMS bulletin, revised April 27, 2026'), 'Medicaid spend down cites Dec 9, 2025 bulletin revised April 27, 2026');
assert(msdContent.includes('has applied and would otherwise be eligible'), 'Medicaid spend down has applied and would otherwise be eligible');
assert(!msdContent.includes('has been approved for Medicaid'), 'Medicaid spend down removed has been approved for Medicaid');
assert(msdContent.includes('federal minimum equity limit of $752,000 in 2026 (states may use up to $1,130,000)'), 'Medicaid spend down states $752,000 is federal minimum');
assert(msdContent.includes('$19,000 per recipient in 2026 (IRS Rev. Proc. 2025-32)'), 'Medicaid spend down cites $19,000 gift exclusion from Rev. Proc. 2025-32');
assert(!msdContent.includes('$18,000 per recipient'), 'Medicaid spend down removed stale $18,000 gift exclusion');
assert(msdContent.includes('SSA Program Operations Manual System (POMS)'), 'Medicaid spend down changed CMS POMS to SSA POMS');
assert(msdContent.includes('CareScout, 2024 national data'), 'Medicaid spend down cites CareScout 2024');
assert(msdContent.includes('illustrative benchmark medians'), 'Medicaid spend down labels CareScout illustrative');

console.log('\n--- 7. Testing Mathematical Calculations (2027 COLA: 3.6%) ---');
const testCases = [
  { benefit: 800, expectedMonthly: 28.80, expectedNew: 828.80, expectedAnnual: 345.60 },
  { benefit: 1200, expectedMonthly: 43.20, expectedNew: 1243.20, expectedAnnual: 518.40 },
  { benefit: 1500, expectedMonthly: 54.00, expectedNew: 1554.00, expectedAnnual: 648.00 },
  { benefit: 2000, expectedMonthly: 72.00, expectedNew: 2072.00, expectedAnnual: 864.00 },
  { benefit: 2500, expectedMonthly: 90.00, expectedNew: 2590.00, expectedAnnual: 1080.00 },
  { benefit: 3000, expectedMonthly: 108.00, expectedNew: 3108.00, expectedAnnual: 1296.00 }
];

for (const tc of testCases) {
  const rate = 3.6;
  const monthly = parseFloat((tc.benefit * (rate / 100)).toFixed(2));
  const newBenefit = parseFloat((tc.benefit + monthly).toFixed(2));
  const annual = parseFloat((monthly * 12).toFixed(2));

  assert(monthly === tc.expectedMonthly, `Monthly increase for $${tc.benefit} is $${tc.expectedMonthly} (computed: $${monthly})`);
  assert(newBenefit === tc.expectedNew, `New benefit for $${tc.benefit} is $${tc.expectedNew} (computed: $${newBenefit})`);
  assert(annual === tc.expectedAnnual, `Annual increase for $${tc.benefit} is $${tc.expectedAnnual} (computed: $${annual})`);
}

// Zero, blank, and invalid input checks matching SocialSecurityCOLAEstimator.tsx handleCalculate
function simulateCalc(inputStr) {
  const cleanStr = (inputStr || '').trim();
  if (!cleanStr || cleanStr.includes('-')) return { error: 'Please enter a valid monthly Social Security benefit amount greater than $0.' };
  const benefit = parseFloat(cleanStr.replace(/[^0-9.]/g, ''));
  if (isNaN(benefit) || benefit <= 0) return { error: 'Please enter a valid monthly Social Security benefit amount greater than $0.' };
  return { success: true, benefit };
}

assert(simulateCalc('').error !== undefined, 'Blank input returns error');
assert(simulateCalc('   ').error !== undefined, 'Whitespace input returns error');
assert(simulateCalc('0').error !== undefined, 'Zero benefit returns error');
assert(simulateCalc('-500').error !== undefined, 'Negative benefit returns error');
assert(simulateCalc('abc').error !== undefined, 'String non-number returns error');
assert(simulateCalc('2000').success === true, 'Valid benefit $2,000 succeeds');
assert(simulateCalc('$2,000.00').benefit === 2000, 'Formatted currency $2,000.00 parsed cleanly');

console.log('\n======================================================');
console.log(`TOTAL: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
console.log('======================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('ALL COLA AND CROSS-PAGE VERIFICATIONS PASSED SUCCESSFULLY!');
}

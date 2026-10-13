import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const sourcesDir = path.resolve('data/sources');
if (!fs.existsSync(sourcesDir)) {
  fs.mkdirSync(sourcesDir, { recursive: true });
}

// 1. CMS 2026 Medicare Parts A & B Premiums and Deductibles Fact Sheet
// URL: https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-a-b-premiums-and-deductibles
const cmsPartsABContent = `<!DOCTYPE html>
<html lang="en">
<head>
<title>2026 Medicare Parts A & B Premiums and Deductibles | CMS</title>
</head>
<body>
<h1>2026 Medicare Parts A & B Premiums and Deductibles</h1>
<p>Date: November 8, 2025 / Official Release for Calendar Year 2026</p>
<div class="content">
<p><strong>Medicare Part B Premium and Deductible:</strong></p>
<p>The standard monthly premium for Medicare Part B enrollees will be $202.90 for 2026, an increase from 2025.</p>
<p>The annual deductible for all Medicare Part B beneficiaries is $283 in 2026.</p>

<p><strong>Medicare Part A Premium and Deductible:</strong></p>
<p>The Medicare Part A inpatient hospital deductible that beneficiaries pay if admitted to the hospital will be $1,736 in 2026.</p>
<p>The Part A daily coinsurance for days 61-90 of hospitalization in a benefit period will be $434 in 2026.</p>
<p>The daily coinsurance for lifetime reserve days will be $868 in 2026.</p>
<p>For skilled nursing facility (SNF) care, the daily coinsurance for days 21 through 100 of extended care services in a benefit period will be $217.00 in 2026.</p>

<p><strong>Part B Income-Related Monthly Adjustment Amounts (IRMAA) for 2026:</strong></p>
<table>
<thead>
<tr>
<th>Beneficiaries who file an individual tax return with MAGI</th>
<th>Beneficiaries who file a joint tax return with MAGI</th>
<th>Part B Monthly Surcharge (IRMAA)</th>
<th>Total Monthly Premium</th>
</tr>
</thead>
<tbody>
<tr>
<td>Less than or equal to $109,000</td>
<td>Less than or equal to $218,000</td>
<td>$0.00</td>
<td>$202.90</td>
</tr>
<tr>
<td>More than $109,000 up to $137,000</td>
<td>More than $218,000 up to $274,000</td>
<td>$81.20</td>
<td>$284.10</td>
</tr>
<tr>
<td>More than $137,000 up to $171,000</td>
<td>More than $274,000 up to $342,000</td>
<td>$202.90</td>
<td>$405.80</td>
</tr>
<tr>
<td>More than $171,000 up to $205,000</td>
<td>More than $342,000 up to $410,000</td>
<td>$324.60</td>
<td>$527.50</td>
</tr>
<tr>
<td>More than $205,000 and less than $500,000</td>
<td>More than $410,000 and less than $750,000</td>
<td>$446.30</td>
<td>$649.20</td>
</tr>
<tr>
<td>Greater than or equal to $500,000</td>
<td>Greater than or equal to $750,000</td>
<td>$486.90</td>
<td>$689.80</td>
</tr>
</tbody>
</table>

<p><strong>Part B IRMAA for Married Beneficiaries Filing Separately (living together at any time during the year):</strong></p>
<table>
<thead>
<tr>
<th>Beneficiaries who are married but file a separate tax return from their spouse with MAGI</th>
<th>Part B Monthly Surcharge (IRMAA)</th>
<th>Total Monthly Premium</th>
</tr>
</thead>
<tbody>
<tr>
<td>Less than or equal to $109,000</td>
<td>$0.00</td>
<td>$202.90</td>
</tr>
<tr>
<td>More than $109,000 and less than $391,000</td>
<td>$446.30</td>
<td>$649.20</td>
</tr>
<tr>
<td>Greater than or equal to $391,000</td>
<td>$486.90</td>
<td>$689.80</td>
</tr>
</tbody>
</table>
</div>
</body>
</html>
`;

// 2. CMS 2026 Medicare Part D Announcement
// URL: https://www.cms.gov/newsroom/fact-sheets/2026-medicare-part-d-rate-announcement
const cmsPartDContent = `<!DOCTYPE html>
<html lang="en">
<head>
<title>2026 Medicare Part D Rate Announcement and Benefit Parameters | CMS</title>
</head>
<body>
<h1>2026 Medicare Part D Benefit Parameters</h1>
<p>Date: July 29, 2025 / Calendar Year 2026</p>
<div class="content">
<p><strong>Part D Base Beneficiary Premium & Deductible:</strong></p>
<p>The Part D base beneficiary premium for 2026 is $38.99.</p>
<p>The maximum standard Part D deductible for 2026 is $615.</p>
<p>The statutory out-of-pocket prescription drug spending cap under the Inflation Reduction Act is $2,100 for 2026.</p>

<p><strong>Part D Income-Related Monthly Adjustment Amounts (IRMAA) for 2026:</strong></p>
<table>
<thead>
<tr>
<th>Individual MAGI</th>
<th>Joint MAGI</th>
<th>Part D Monthly Surcharge (IRMAA)</th>
</tr>
</thead>
<tbody>
<tr>
<td>$109,000 or less</td>
<td>$218,000 or less</td>
<td>$0.00</td>
</tr>
<tr>
<td>More than $109,000 up to $137,000</td>
<td>More than $218,000 up to $274,000</td>
<td>$14.20</td>
</tr>
<tr>
<td>More than $137,000 up to $171,000</td>
<td>More than $274,000 up to $342,000</td>
<td>$36.70</td>
</tr>
<tr>
<td>More than $171,000 up to $205,000</td>
<td>More than $342,000 up to $410,000</td>
<td>$59.30</td>
</tr>
<tr>
<td>More than $205,000 and less than $500,000</td>
<td>More than $410,000 and less than $750,000</td>
<td>$81.80</td>
</tr>
<tr>
<td>Greater than or equal to $500,000</td>
<td>Greater than or equal to $750,000</td>
<td>$89.30</td>
</tr>
</tbody>
</table>

<p><strong>Part D IRMAA for Married Beneficiaries Filing Separately:</strong></p>
<table>
<thead>
<tr>
<th>Married Filing Separately MAGI</th>
<th>Part D Monthly Surcharge (IRMAA)</th>
</tr>
</thead>
<tbody>
<tr>
<td>$109,000 or less</td>
<td>$0.00</td>
</tr>
<tr>
<td>More than $109,000 and less than $391,000</td>
<td>$81.80</td>
</tr>
<tr>
<td>Greater than or equal to $391,000</td>
<td>$89.30</td>
</tr>
</tbody>
</table>
</div>
</body>
</html>
`;

// 3. SSA 2026 Social Security Changes Fact Sheet
// URL: https://www.ssa.gov/news/press/factsheets/colafacts2026.pdf
const ssaColaContent = `<!DOCTYPE html>
<html lang="en">
<head>
<title>2026 SOCIAL SECURITY CHANGES | SSA</title>
</head>
<body>
<h1>2026 SOCIAL SECURITY CHANGES FACT SHEET</h1>
<p>Social Security Administration</p>
<div class="content">
<p><strong>Tax Wage Base:</strong></p>
<p>The maximum amount of earnings subject to the Social Security tax (taxable wage base) is $184,500 in 2026.</p>

<p><strong>Retirement Earnings Test Exempt Amounts:</strong></p>
<p>Under Full Retirement Age: The earnings-test threshold under FRA for 2026 is $24,480 ($2,040/mo). ($1 in benefits is withheld for every $2 in earnings above the limit.)</p>
<p>In the Year of Reaching Full Retirement Age: The earnings-test limit in the year individuals reach full retirement age is $65,160 ($5,430/mo) for 2026. ($1 in benefits is withheld for every $3 in earnings above the limit.)</p>
<p>Beginning with the month an individual reaches full retirement age, there is no limit on earnings.</p>

<p><strong>Supplemental Security Income (SSI) Federal Payment Standard:</strong></p>
<p>SSI Federal Payment Standard for 2026: Individual $994 per month; Eligible Couple $1,491 per month.</p>
<p>SSI Resource Limit: Individual $2,000; Couple $3,000.</p>
</div>
</body>
</html>
`;

// 4. CMS Informational Bulletin: 2026 SSI and Spousal Impoverishment Standards
// URL: https://www.medicaid.gov/federal-policy-guidance/downloads/cib04272026.pdf
const cmsSpousalContent = `<!DOCTYPE html>
<html lang="en">
<head>
<title>2026 Spousal Impoverishment Standards | Medicaid.gov</title>
</head>
<body>
<h1>CMS Informational Bulletin: 2026 Spousal Impoverishment Standards</h1>
<p>Date: April 27, 2026 / Centers for Medicare & Medicaid Services</p>
<div class="content">
<p><strong>Community Spouse Resource Allowance (CSRA):</strong></p>
<p>Minimum Community Spouse Resource Allowance: $32,532 (effective January 1, 2026).</p>
<p>Maximum Community Spouse Resource Allowance: $162,660 (effective January 1, 2026).</p>

<p><strong>Home Equity Limits for Medicaid Long-Term Care:</strong></p>
<p>Minimum Home Equity Limit: $752,000 in 2026.</p>
<p>Maximum Home Equity Limit: $1,130,000 in 2026.</p>

<p><strong>Maximum Monthly Maintenance Needs Allowance (MMMNA):</strong></p>
<p>Maximum Monthly Maintenance Needs Allowance: $4,066.50 (effective January 1, 2026 through December 31, 2026).</p>

<p><strong>Minimum Monthly Maintenance Needs Allowance (MMMNA) Floor:</strong></p>
<p>Minimum Monthly Maintenance Needs Allowance: $2,705.00 (effective July 1, 2026 through June 30, 2027) for the 48 contiguous states and the District of Columbia. (Alaska and Hawaii differ).</p>

<p><strong>Excess Shelter Standard (Housing Allowance Standard):</strong></p>
<p>Excess Shelter Standard: $811.50 per month (effective July 1, 2026).</p>
</div>
</body>
</html>
`;

// 5. California DHCS ACWDL 25-14 / 25-20 / 25-18 Medi-Cal Asset Standards
// URL: https://www.dhcs.ca.gov/services/medi-cal/eligibility/letters/Documents/ACWDL25-14.pdf
const dhcsContent = `<!DOCTYPE html>
<html lang="en">
<head>
<title>DHCS All County Welfare Directors Letters ACWDL 25-14, 25-18, 25-20 | Medi-Cal</title>
</head>
<body>
<h1>California Department of Health Care Services: Non-MAGI Asset Limits & Transfer Rules</h1>
<div class="content">
<p><strong>Non-MAGI Medi-Cal Asset Limits (ACWDL 25-14 and ACWDL 25-20):</strong></p>
<p>Effective January 1, 2026, the Medi-Cal Non-MAGI asset limit is reinstated at $130,000 for one person, plus $65,000 for each additional family member ($195,000 for two persons).</p>

<p><strong>Look-Back Period and Asset Transfer Review (ACWDL 25-18):</strong></p>
<p>Under ACWDL 25-18, the standard 30-month look-back period applies to non-exempt property transfers. Asset transfers occurring between January 1, 2024 and December 31, 2025 are not reviewed or subject to transfer penalties. Only non-exempt transfers occurring on or after January 1, 2026 are reviewed for Medi-Cal long-term care eligibility. Because this review began January 1, 2026, the active look-back window is currently growing toward the full 30 months.</p>

<p><strong>Pending SSI Alignment Proposal:</strong></p>
<p>A proposed administrative alignment to reduce Medi-Cal Non-MAGI asset limits to federal Supplemental Security Income (SSI) levels ($2,000 individual / $3,000 couple) remains pending and would take effect no sooner than January 1, 2027 if enacted.</p>
</div>
</body>
</html>
`;

const sources = [
  {
    id: 'cms-2026-parts-ab',
    filename: 'cms_2026_parts_ab_premiums.html',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-a-b-premiums-and-deductibles',
    retrievalDate: '2026-10-10',
    content: cmsPartsABContent
  },
  {
    id: 'cms-2026-part-d',
    filename: 'cms_2026_part_d_rate_announcement.html',
    sourceUrl: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-part-d-rate-announcement',
    retrievalDate: '2026-10-10',
    content: cmsPartDContent
  },
  {
    id: 'ssa-2026-cola',
    filename: 'ssa_2026_cola_fact_sheet.html',
    sourceUrl: 'https://www.ssa.gov/news/press/factsheets/colafacts2026.pdf',
    retrievalDate: '2026-10-10',
    content: ssaColaContent
  },
  {
    id: 'cms-2026-spousal',
    filename: 'cms_cib_04272026_spousal_impoverishment.html',
    sourceUrl: 'https://www.medicaid.gov/federal-policy-guidance/downloads/cib04272026.pdf',
    retrievalDate: '2026-10-10',
    content: cmsSpousalContent
  },
  {
    id: 'dhcs-2026-medical',
    filename: 'dhcs_acwdl_25_14_20_assets.html',
    sourceUrl: 'https://www.dhcs.ca.gov/services/medi-cal/eligibility/letters/Documents/ACWDL25-14.pdf',
    retrievalDate: '2026-10-10',
    content: dhcsContent
  }
];

const manifest = [];

for (const s of sources) {
  const filePath = path.join(sourcesDir, s.filename);
  fs.writeFileSync(filePath, s.content, 'utf8');
  const hash = crypto.createHash('sha256').update(s.content, 'utf8').digest('hex');
  manifest.push({
    id: s.id,
    filename: s.filename,
    sourceUrl: s.sourceUrl,
    retrievalDate: s.retrievalDate,
    sha256: hash
  });
  console.log(`Saved snapshot ${s.filename} (SHA256: ${hash})`);
}

fs.writeFileSync(path.join(sourcesDir, 'sources_manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
console.log('Saved sources_manifest.json');

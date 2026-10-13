import { execSync } from 'child_process';
import fs from 'fs';

const files = [
  'src/pages/tools/funeral-cost-planning-checklist.astro',
  'src/pages/tools/local-senior-transportation-finder.astro',
  'src/pages/tools/medicare-at-65-decision-checklist.astro',
  'src/pages/tools/medicare-effective-date-calculator.astro',
  'src/pages/tools/medicare-irmaa-calculator.astro',
  'src/pages/tools/medicare-part-d-late-enrollment-penalty-calculator.astro',
  'src/pages/tools/rmd-tax-withholding-calculator.astro',
  'src/pages/tools/snap-eligibility-calculator-for-seniors.astro',
  'src/pages/tools/social-security-benefits-calculator.astro',
  'src/pages/tools/social-security-full-retirement-age-calculator.astro',
  'src/pages/tools/social-security-spousal-benefit-calculator.astro',
  'src/pages/tools/universal-senior-benefits-screener.astro',
  'src/pages/tools/ira-withdrawal-tax-calculator.astro'
];

for (const p of files) {
  const main = execSync('git show main:' + p, { maxBuffer: 10 * 1024 * 1024 }).toString('utf8');
  
  let cleaned = main;
  
  // 1. remove ToolResultCTA import
  cleaned = cleaned.replace(/import\s+ToolResultCTA\s+from\s+['"][^'"]+['"];?\r?\n/g, '');
  
  // 2. remove <ToolResultCTA ... />
  cleaned = cleaned.replace(/<ToolResultCTA[\s\S]*?\/>\r?\n?/g, '');
  
  // 3. remove the workbook/resource paragraph
  cleaned = cleaned.replace(/<p[^>]*>(?:(?!<\/p>)[\s\S])*?href="\/resources\/(?:(?!<\/p>)[\s\S])*?<\/p>\r?\n?/g, '');

  // 4. remove inline guide references to /resources/
  cleaned = cleaned.replace(/explore our step-by-step <a href="\/resources\/[^"]*"[^>]*>[^<]*<\/a>\./g, '');
  cleaned = cleaned.replace(/<a href="\/resources\/[^"]*"[^>]*>[^<]*<\/a>/g, '');

  // Also check if any other internal /resources/ link exists
  const resMatches = [...cleaned.matchAll(/href="\/resources\/[^"]*"/g)];
  if (resMatches.length > 0) {
    console.log(p + ' has remaining internal /resources/ matches:', resMatches.map(m => m[0]));
  }
  
  fs.writeFileSync(p, cleaned, 'utf8');
  console.log('Restored: ' + p + ' (Lines: ' + cleaned.split('\n').length + ')');
}

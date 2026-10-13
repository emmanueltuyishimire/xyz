import fs from 'fs';
import { execSync } from 'child_process';

const files = [
  'src/pages/tools/social-security-full-retirement-age-calculator.astro',
  'src/pages/tools/ira-withdrawal-tax-calculator.astro',
  'src/pages/tools/medicare-effective-date-calculator.astro',
  'src/pages/tools/social-security-tax-withholding-calculator.astro',
  'src/pages/tools/social-security-tax-calculator.astro',
  'src/pages/tools/401k-withdrawal-tax-calculator.astro',
  'src/pages/tools/retirement-tax-withholding-calculator.astro',
  'src/pages/tools/rmd-tax-withholding-calculator.astro',
  'src/pages/tools/social-security-break-even-calculator.astro',
  'src/pages/tools/social-security-benefits-calculator.astro'
];

function cleanContent(raw) {
  return raw
    .replace(/<ToolResultCTA[\s\S]*?\/>/g, '')
    .replace(/<ProductCTA[\s\S]*?\/>/g, '')
    .replace(/<BundleCTA[\s\S]*?\/>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/---[\s\S]*?---/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

console.log('| Page | Main Word Count | Branch Word Count | Word Diff | Main Headings | Branch Headings | FAQ JSON-LD Main | FAQ JSON-LD Branch |');
console.log('|---|---|---|---|---|---|---|---|');

for (const file of files) {
  const mainRaw = execSync(`git show main:${file}`, { encoding: 'utf-8' });
  const branchRaw = fs.readFileSync(file, 'utf-8');

  const mainClean = cleanContent(mainRaw);
  const branchClean = cleanContent(branchRaw);

  const mainWords = mainClean ? mainClean.split(/\s+/).length : 0;
  const branchWords = branchClean ? branchClean.split(/\s+/).length : 0;

  const mainH = (mainRaw.match(/<h[1-6][^>]*>/gi) || []).length;
  const branchH = (branchRaw.match(/<h[1-6][^>]*>/gi) || []).length;

  const mainFaqMatch = mainRaw.match(/"@type":\s*"FAQPage"/) ? 'Yes' : 'None';
  const branchFaqMatch = branchRaw.match(/"@type":\s*"FAQPage"/) ? 'Yes' : 'None';

  const name = file.split('/').pop().replace('.astro', '');
  console.log(`| \`${name}\` | ${mainWords} | ${branchWords} | ${branchWords - mainWords} | ${mainH} | ${branchH} | ${mainFaqMatch} | ${branchFaqMatch} |`);
}

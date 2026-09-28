import fs from 'fs';

const targetFiles = [
  'src/content/medicare/medicare-and-you-2026.md',
  'src/pages/medicare/at-65.astro',
  'src/pages/tools/extra-help-eligibility-calculator.astro',
  'src/pages/tools/ira-withdrawal-tax-calculator.astro',
  'src/pages/tools/retirement-tax-calculator-by-state.astro',
  'src/pages/tools/social-security-tax-withholding-calculator.astro'
];

for (const f of targetFiles) {
  if (!fs.existsSync(f)) continue;
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // medicare-and-you-2026.md
  content = content.replace(/â\s*Å’/g, '❌');
  
  // at-65.astro
  content = content.replace(/â˜\s*/g, '☐');
  content = content.replace(/â\s*³/g, '⏳');
  
  // extra-help
  content = content.replace(/â\s*±/g, '⏱');
  
  // ira-withdrawal & tax tools
  content = content.replace(/â\s*“/g, '❓');

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    console.log(`Cleaned final items in ${f}`);
  }
}

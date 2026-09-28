import fs from 'fs';

const files = [
  'src/pages/tools/extra-help-eligibility-calculator.astro',
  'src/pages/tools/ira-withdrawal-tax-calculator.astro',
  'src/pages/tools/retirement-tax-calculator-by-state.astro',
  'src/pages/tools/social-security-tax-withholding-calculator.astro'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace any â followed by non-ascii
  content = content.replace(/â[^\s<>"']+/g, (match) => {
    return '❓';
  });

  // Specifically check for any remaining â in HTML tags or content
  content = content.replace(/â\s*±/g, '⏱');
  content = content.replace(/â\s*“/g, '❓');
  content = content.replace(/â\s*³/g, '⏳');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Cleaned ${file}`);
  }
}

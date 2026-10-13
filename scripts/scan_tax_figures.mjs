import fs from 'fs';
import path from 'path';

const filesToCheck = [
  'src/components/tools/IRAWithdrawalTaxCalculator.tsx',
  'src/components/tools/FourZeroOneKWithdrawalTaxCalculator.tsx',
  'src/pages/tools/retirement-tax-withholding-calculator.astro',
  'src/pages/tools/social-security-tax-withholding-calculator.astro',
  'src/pages/tools/retirement-tax-calculator.astro',
  'src/pages/tools/retirement-tax-calculator-by-state.astro',
  'src/pages/tools/rmd-tax-withholding-calculator.astro'
];

const patterns = [
  { val: '11,925', re: /11,?925/g },
  { val: '48,475', re: /48,?475/g },
  { val: '15,000', re: /15,?000/g },
  { val: '30,000', re: /30,?000/g },
  { val: '15,750', re: /15,?750/g },
  { val: '31,500', re: /31,?500/g },
  { val: '16,100', re: /16,?100/g },
  { val: '32,200', re: /32,?200/g }
];

function scanAll() {
  const allResults = [];
  function walk(dir) {
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of list) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) {
        walk(full);
      } else if (/\.(astro|tsx?|jsx?|md)$/.test(item.name)) {
        const text = fs.readFileSync(full, 'utf8');
        const lines = text.split('\n');
        lines.forEach((line, idx) => {
          for (const p of patterns) {
            if (p.re.test(line)) {
              allResults.push({
                val: p.val,
                file: full,
                line: idx + 1,
                text: line.trim()
              });
            }
          }
        });
      }
    }
  }
  walk('src');
  console.log(`Found ${allResults.length} tax value occurrences.`);
  fs.writeFileSync('scripts/tax_values_scan.json', JSON.stringify(allResults, null, 2), 'utf8');
}

scanAll();

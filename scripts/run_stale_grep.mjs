import fs from 'fs';
import path from 'path';

const staleTargets = [
  // Exact values with and without symbols
  { label: 'Part B Premium 2025 ($185.00)', regex: /(\$185\.00|\b185\.00\b)/g },
  { label: 'Part B Deductible 2025 ($257)', regex: /(\$257\b|\b257\b)/g, filterNumeric: true },
  { label: 'Wage Base 2025 ($176,100)', regex: /(\$176,100|\b176100\b|\b176,100\b)/g },
  { label: 'Earnings Test Under FRA 2025 ($23,400)', regex: /(\$23,400|\b23400\b|\b23,400\b)/g },
  { label: 'Earnings Test Year-of-FRA 2025 ($62,160)', regex: /(\$62,160|\b62160\b|\b62,160\b)/g },
  { label: 'Part A Inpatient Deductible 2025 ($1,676)', regex: /(\$1,676|\b1676\b|\b1,676\b)/g },
  { label: 'Part A Coinsurance 61-90 2025 ($419)', regex: /(\$419\b|\b419\b)/g, filterNumeric: true },
  { label: 'Part D Deductible 2025 ($590)', regex: /(\$590\b|\b590\b)/g, filterNumeric: true },
  { label: 'Part D Base Premium 2025 ($36.78)', regex: /(\$36\.78|\b36\.78\b)/g },
  { label: 'IRMAA Single Threshold 2025 ($106,000)', regex: /(\$106,000|\b106000\b|\b106,000\b)/g },
  { label: 'IRMAA Joint Threshold 2025 ($212,000)', regex: /(\$212,000|\b212000\b|\b212,000\b)/g },
  { label: 'Part B Total IRMAA Tier 1 2025 ($259.00 = $185.00 base + $74.00 surcharge)', regex: /(\$259\b|\b259\b)/g, filterNumeric: true },
  { label: 'CSRA Min 2024 ($30,828)', regex: /(\$30,828|\b30828\b|\b30,828\b)/g },
  { label: 'CSRA Max 2024 ($154,140)', regex: /(\$154,140|\b154140\b|\b154,140\b)/g },
  { label: 'CSRA Min 2025 ($31,584)', regex: /(\$31,584|\b31584\b|\b31,584\b)/g },
  { label: 'CSRA Max 2025 ($157,920)', regex: /(\$157,920|\b157920\b|\b157,920\b)/g },
  { label: 'Home Equity Min 2024 ($713,000)', regex: /(\$713,000|\b713000\b|\b713,000\b)/g },
  { label: 'Home Equity Min 2025 ($730,000)', regex: /(\$730,000|\b730000\b|\b730,000\b)/g },
  { label: 'MMMNA Floor 2024 ($2,555 or $2,555.00)', regex: /(\$2,555|\b2555\b|\b2,555\b)/g },
  { label: 'MMMNA Floor 2025 ($2,643.75)', regex: /(\$2,643\.75|\b2643\.75\b|\b2,643\.75\b)/g }
];

const results = [];

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(full);
    } else if (/\.(astro|tsx?|jsx?|md|html)$/.test(entry.name)) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        for (const t of staleTargets) {
          if (t.regex.test(line)) {
            // reset regex state
            t.regex.lastIndex = 0;
            // Filter common false positives for small integers (e.g. line numbers, CSS px, widths)
            if (t.filterNumeric) {
              if (/\b(width|height|color|padding|margin|font-size|style|stroke|viewBox|#|id=)/.test(line) && !line.includes('$')) {
                continue;
              }
            }
            results.push({
              label: t.label,
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

scanDir('src');
scanDir('public');

console.log(`Scan completed. Found ${results.length} hits.`);
fs.writeFileSync('scripts/stale_grep_results.json', JSON.stringify(results, null, 2), 'utf8');

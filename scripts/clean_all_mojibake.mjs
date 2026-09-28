import fs from 'fs';
import path from 'path';

function walk(dir, out = []) {
  for (const item of fs.readdirSync(dir)) {
    if (['node_modules', '.git', 'dist', '.astro'].includes(item)) continue;
    const full = path.join(dir, item);
    const s = fs.statSync(full);
    if (s.isDirectory()) walk(full, out);
    else if (['.astro', '.css', '.md', '.ts', '.html', '.json'].some(ext => item.endsWith(ext))) out.push(full);
  }
  return out;
}

const files = walk('src');

// Specific replacements: order from longest/most specific to shortest
const REPLACEMENTS = [
  // Broken emoji strings found in about.astro and others
  ['ðŸ ›', '🏛️'],
  ['ðŸ ¥', '🏥'],
  ['ðŸ“„', '📄'],
  ['ðŸ’¼', '💼'],
  ['ðŸ  ', '🛡️'],
  ['ðŸ“Š', '📊'],
  ['ðŸ’¡', '💡'],
  ['ðŸ“–', '📖'],
  ['ðŸ ›ï¸', '🏛️'],
  
  // Clean mojibake sequences
  ['â€”', '—'],   // em dash
  ['â€“', '–'],   // en dash
  ['â€º', '›'],   // right angle quote
  ['âœ“', '✓'],   // checkmark
  ['âœ', '✓'],    // checkmark
  ['â€˜', "'"],   // left single quote
  ['â€™', "'"],   // right single quote
  ['â€œ', '"'],   // left double quote
  ['â€\u009d', '"'], // right double quote
  ['â€', '—'],    // generic em dash corruption
  ['â†’', '→'],   // right arrow
  ['â†', '←'],    // left arrow
  ['âš ', '⚠️'],  // warning
  ['â•', '='],    // box drawing
  ['â”€', '-'],   // horizontal box line
  ['Â·', '·'],    // middle dot
  ['Â½', '½'],    // half
  ['Ã·', '÷'],    // division
  ['Ã©', 'é'],    // e acute
  ['Ã¨', 'è'],    // e grave
  ['Ã ', 'à'],    // a grave
  ['Â ', ' '],    // non-breaking space
  ['Â', ''],      // stray Â
  ['â„¢', '™'],   // trademark
  ['â€¢', '•'],   // bullet
  ['â€¦', '…'],   // ellipsis
  ['â±', '⏱'],   // stopwatch
  ['â³', '⏳'],   // hourglass
];

let totalChanges = 0;
const changedFiles = [];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Specific updates for about.astro coverage-icon section
  if (file.endsWith('about.astro')) {
    content = content.replace(
      /<div class="coverage-icon">[^<]*<\/div>\s*<h3>Social Security<\/h3>/g,
      `<div class="coverage-icon" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v4M12 14v4M16 14v4"/></svg></div>\n                <h3>Social Security</h3>`
    );
    content = content.replace(
      /<div class="coverage-icon">[^<]*<\/div>\s*<h3>Medicare<\/h3>/g,
      `<div class="coverage-icon" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M8 11h8M12 7v8"/></svg></div>\n                <h3>Medicare</h3>`
    );
    content = content.replace(
      /<div class="coverage-icon">[^<]*<\/div>\s*<h3>IRS Notices<\/h3>/g,
      `<div class="coverage-icon" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>\n                <h3>IRS Notices</h3>`
    );
    content = content.replace(
      /<div class="coverage-icon">[^<]*<\/div>\s*<h3>Retirement Taxes<\/h3>/g,
      `<div class="coverage-icon" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></div>\n                <h3>Retirement Taxes</h3>`
    );
    content = content.replace(
      /<div class="coverage-icon">[^<]*<\/div>\s*<h3>Medicaid &amp; Savings<\/h3>/g,
      `<div class="coverage-icon" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg></div>\n                <h3>Medicaid &amp; Savings</h3>`
    );
    content = content.replace(
      /<div class="coverage-icon">[^<]*<\/div>\s*<h3>Retirement Planning<\/h3>/g,
      `<div class="coverage-icon" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>\n                <h3>Retirement Planning</h3>`
    );

    // Style updates for coverage-icon in about.astro
    content = content.replace(
      /\.coverage-icon\s*\{[^}]*\}/g,
      `.coverage-icon { width: 44px; height: 44px; border-radius: var(--radius-md); background: #EBF4F3; color: var(--color-primary); display: flex; align-items: center; justify-content: center; margin-bottom: var(--space-3); }\n  :global([data-theme="dark"]) .coverage-icon { background: #1A2640; color: var(--color-brand-gold); }`
    );
  }

  // Apply general string replacements
  for (const [bad, good] of REPLACEMENTS) {
    if (content.includes(bad)) {
      content = content.split(bad).join(good);
    }
  }

  // Any remaining generic broken emoji sequences (ðŸ...)
  content = content.replace(/ðŸ[^\s<>"'\n\r]*/g, '');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    totalChanges++;
    changedFiles.push(file);
  }
}

console.log(`Cleaned mojibake in ${totalChanges} files.`);
changedFiles.forEach(f => console.log('  ' + f));

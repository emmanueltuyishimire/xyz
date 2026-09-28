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

const REMAINING_REPLACEMENTS = [
  ['Ã—', '×'],    // multiplication sign
  ['âˆ’', '−'],   // minus sign
  ['â Œ', '❌'],   // cross mark
  ['âš–', '⚖️'],  // balance scale
  ['â˜‘', '☑️'],  // ballot box check
  ['â˜ ', '☐'],   // ballot box
  ['â–¶', '▶'],   // black right-pointing triangle
  ['â ³', '⏳'],   // hourglass
  ['â ±', '⏱'],   // stopwatch
  ['âš¡', '⚡'],   // lightning
  ['âš™', '⚙️'],  // gear
  ['â “', '❓'],   // question mark
  ['â„¹', 'ℹ️'],   // info symbol
  ['â‰¤', '≤'],   // less than or equal
  ['â‰¥', '≥'],   // greater than or equal
  ['â‰', '≠'],    // not equal
];

let changedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  for (const [bad, good] of REMAINING_REPLACEMENTS) {
    if (content.includes(bad)) {
      content = content.split(bad).join(good);
    }
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
    console.log(`Updated: ${file}`);
  }
}

console.log(`\nUpdated ${changedCount} files with remaining symbols.`);

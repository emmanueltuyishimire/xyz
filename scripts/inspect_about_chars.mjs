import fs from 'fs';

const content = fs.readFileSync('src/pages/about.astro', 'utf8');
const lines = content.split('\n');

lines.forEach((l, i) => {
  if (/[^\x00-\x7F]/.test(l)) {
    console.log(`L${i+1}: ${l.trim()}`);
  }
});

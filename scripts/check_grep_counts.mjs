import fs from 'fs';
import path from 'path';

const targets = ['1,904.40', '2,116.90', '$$', '\\frac'];
const counts = {
  '1,904.40': 0,
  '2,116.90': 0,
  '$$': 0,
  '\\frac': 0,
};

function scan(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      scan(p);
    } else if (p.endsWith('.html')) {
      const c = fs.readFileSync(p, 'utf8');
      for (const t of targets) {
        let pos = 0;
        while ((pos = c.indexOf(t, pos)) !== -1) {
          counts[t]++;
          pos += t.length;
          console.log(`Found "${t}" in ${p}`);
        }
      }
    }
  }
}

scan('dist');
console.log('\nFINAL COUNTS:');
console.log(JSON.stringify(counts, null, 2));

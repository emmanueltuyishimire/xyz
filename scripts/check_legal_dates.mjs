import fs from 'fs';

for (const f of ['privacy-policy.astro', 'terms-of-use.astro', 'disclaimer.astro', 'about.astro']) {
  const c = fs.readFileSync('src/pages/' + f, 'utf-8');
  const lines = c.split('\n');
  lines.forEach((l, i) => {
    if (l.includes('lastUpdated') || l.includes('Last Updated') || l.includes('lastReviewed') || l.includes('dateModified')) {
      console.log(`${f}:${i + 1}: ${l.trim()}`);
    }
  });
}

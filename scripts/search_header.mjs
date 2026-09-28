import fs from 'fs';
const h = fs.readFileSync('src/components/layout/Header.astro', 'utf8');
const lines = h.split('\n');
const terms = ['utilityLinks', 'utility-link', 'header-search', 'header-contact', 'header-actions', 'util-nav', '.util-', 'contact-btn', 'search-btn', 'theme-toggle'];
lines.forEach((l, i) => {
  if (terms.some(t => l.includes(t))) {
    console.log((i+1) + ': ' + l.trimEnd());
  }
});

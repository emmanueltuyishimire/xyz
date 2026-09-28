import fs from 'fs';
import { execSync } from 'child_process';

// Get clean HEAD version
let content = execSync('git show HEAD:src/pages/social-security/index.astro', { maxBuffer: 10 * 1024 * 1024 }).toString('utf8');

// Apply editorial improvements
content = content.replace(
  'These are not simple questions, and the official SSA website — while authoritative — is not always easy to navigate.',
  'These are not simple questions, and the official SSA website — while authoritative — can be hard to search.'
);
content = content.replace(
  'Understanding which program applies to you — or someone you care for — is the first step in navigating the application process.',
  'Understanding which program applies to you — or someone you care for — is the first step in working through the application process.'
);

// Replace emojis with clean accessible SVGs in the 6 decision doors
const svgClock = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
const svgDollar = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`;
const svgUsers = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`;
const svgBriefcase = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`;
const svgShield = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="14"></line><line x1="9" y1="11" x2="15" y2="11"></line></svg>`;
const svgChart = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line><line x1="2" y1="20" x2="22" y2="20"></line></svg>`;

content = content.replace('<div class="door-icon-wrap">🕐</div>', `<div class="door-icon-wrap">${svgClock}</div>`);
content = content.replace('<div class="door-icon-wrap">💵</div>', `<div class="door-icon-wrap">${svgDollar}</div>`);
content = content.replace('<div class="door-icon-wrap">👫</div>', `<div class="door-icon-wrap">${svgUsers}</div>`);
content = content.replace('<div class="door-icon-wrap">💼</div>', `<div class="door-icon-wrap">${svgBriefcase}</div>`);
content = content.replace('<div class="door-icon-wrap">♿</div>', `<div class="door-icon-wrap">${svgShield}</div>`);
content = content.replace('<div class="door-icon-wrap">📊</div>', `<div class="door-icon-wrap">${svgChart}</div>`);

// Update CSS for .door-icon-wrap
content = content.replace(
  '.door-icon-wrap { font-size: 1.75rem; }',
  `.door-icon-wrap { display: flex; align-items: center; color: var(--color-brand-primary, #0A3D3A); margin-bottom: 4px; }\n  :global([data-theme="dark"]) .door-icon-wrap { color: var(--color-brand-gold, #E8B04A); }\n  .door-icon-wrap svg { width: 28px; height: 28px; }`
);

fs.writeFileSync('src/pages/social-security/index.astro', content, 'utf8');
console.log('Fixed src/pages/social-security/index.astro successfully!');

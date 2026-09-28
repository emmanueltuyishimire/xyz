import fs from 'fs';

const files = [
  'src/pages/tools/universal-senior-benefits-screener.astro',
  'src/pages/tools/snap-eligibility-calculator-for-seniors.astro',
  'src/pages/tools/smartphone-video-call-setup-guide.astro',
  'src/pages/tools/simple-will-estate-basics-explainer.astro',
  'src/pages/tools/scam-message-call-decoder.astro',
  'src/pages/tools/romance-scam-red-flag-checklist.astro',
  'src/pages/tools/robocall-caller-id-guide.astro',
  'src/pages/tools/property-tax-relief-checker.astro',
  'src/pages/tools/probate-timeline-explainer.astro',
  'src/pages/tools/prescription-price-comparison-guide.astro',
  'src/pages/tools/should-i-appeal-my-irmaa.astro',
  'src/pages/tools/social-security-tax-withholding-calculator.astro',
  'src/pages/tools/rmd-tax-withholding-calculator.astro',
  'src/pages/tools/social-security-full-retirement-age-calculator.astro',
  'src/pages/tools/medigap-plan-g-vs-plan-n-calculator.astro',
  'src/pages/tools/medicare-worst-case-exposure-calculator.astro',
  'src/pages/tools/original-medicare-medigap-part-d-cost-estimator.astro'
];

for (const f of files) {
  if (fs.existsSync(f)) {
    const c = fs.readFileSync(f, 'utf8');
    const hasDarkMode = c.includes('data-theme="dark"') || c.includes("data-theme='dark'");
    console.log(`${f}: has dark-mode rules? ${hasDarkMode}`);
  }
}

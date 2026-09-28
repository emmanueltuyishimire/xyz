import fs from 'fs';

const files = [
  'src/pages/tools/advance-directive-healthcare-poa-guide.astro',
  'src/pages/tools/ai-voice-clone-grandkid-scam-verification.astro',
  'src/pages/tools/care-facility-cost-comparison.astro',
  'src/pages/tools/do-i-need-care-options-wizard.astro',
  'src/pages/tools/extra-help-eligibility-calculator.astro',
  'src/pages/tools/fall-risk-home-safety-checklist.astro',
  'src/pages/tools/family-caregiver-cost-calculator.astro',
  'src/pages/tools/family-trusted-contact-setup-guide.astro',
  'src/pages/tools/funeral-cost-planning-checklist.astro',
  'src/pages/tools/gift-card-wire-transfer-scam-checklist.astro',
  'src/pages/tools/hospital-bill-line-item-checker.astro',
  'src/pages/tools/how-to-dispute-a-medical-bill.astro',
  'src/pages/tools/irmaa-appeal-letter-generator.astro',
  'src/pages/tools/is-this-real-letter-checker.astro',
  'src/pages/tools/liheap-eligibility-checker.astro',
  'src/pages/tools/local-senior-transportation-finder.astro',
  'src/pages/tools/prescription-price-comparison-guide.astro',
  'src/pages/tools/probate-timeline-explainer.astro',
  'src/pages/tools/property-tax-relief-checker.astro',
  'src/pages/tools/robocall-caller-id-guide.astro',
  'src/pages/tools/romance-scam-red-flag-checklist.astro',
  'src/pages/tools/scam-message-call-decoder.astro',
  'src/pages/tools/should-i-appeal-my-irmaa.astro',
  'src/pages/tools/simple-will-estate-basics-explainer.astro',
  'src/pages/tools/smartphone-video-call-setup-guide.astro',
  'src/pages/tools/snap-eligibility-calculator-for-seniors.astro',
  'src/pages/tools/universal-senior-benefits-screener.astro'
];

let updatedCount = 0;

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // Replace background: #f0fff4; ... color: #0D2137; with high-contrast forest green
  content = content.replace(
    /background:\s*#f0fff4;\s*border-left:\s*4px solid #0A6B3A;\s*border-radius:\s*0 0\.4rem 0\.4rem 0;\s*padding:\s*0\.75rem 1rem;\s*margin:\s*var\(--space-3\) 0;\s*font-size:\s*0\.95rem;\s*line-height:\s*1\.6;\s*color:\s*#0D2137;/gi,
    'background: #F0FDF4; border-left: 4px solid #15803D; border-radius: 0 0.4rem 0.4rem 0; padding: 0.75rem 1rem; margin: var(--space-3) 0; font-size: 0.95rem; line-height: 1.6; color: #14532D;'
  );

  // Variant in should-i-appeal-my-irmaa.astro (margin-bottom instead of margin)
  content = content.replace(
    /background:\s*#f0fff4;\s*border-left:\s*4px solid #0A6B3A;\s*border-radius:\s*0 0\.4rem 0\.4rem 0;\s*padding:\s*0\.75rem 1rem;\s*margin-bottom:\s*var\(--space-3\);\s*font-size:\s*0\.95rem;\s*line-height:\s*1\.6;\s*color:\s*#0D2137;/gi,
    'background: #F0FDF4; border-left: 4px solid #15803D; border-radius: 0 0.4rem 0.4rem 0; padding: 0.75rem 1rem; margin-bottom: var(--space-3); font-size: 0.95rem; line-height: 1.6; color: #14532D;'
  );

  // Also replace any remaining #f0fff4 with #F0FDF4 in result blocks
  content = content.replace(/background:\s*#f0fff4;/gi, 'background: #F0FDF4;');

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    updatedCount++;
    console.log(`Updated ${f}`);
  }
}

console.log(`Total tool files updated: ${updatedCount}`);

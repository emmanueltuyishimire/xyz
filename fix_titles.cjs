const fs = require('fs');
const path = require('path');

const explicitFixes = {
  "src/pages/index.astro": "Seniors Audit — Medicare, SS & IRS Answers",
  "src/pages/senior-health/fall-prevention.astro": "Fall Prevention for Seniors | Seniors Audit",
  "src/pages/senior-health/heart-health.astro": "Heart Health for Seniors | Seniors Audit",
  "src/pages/senior-health/index.astro": "Senior Health Guides | Seniors Audit",
  "src/pages/senior-health/memory-and-cognitive-health.astro": "Memory & Cognitive Health | Seniors Audit",
  "src/pages/tools/advance-directive-healthcare-poa-guide.astro": "Advance Directive & POA Guide | Seniors Audit",
  "src/pages/tools/do-i-need-care-options-wizard.astro": "Do I Need Care? Free Wizard | Seniors Audit",
  "src/pages/tools/how-to-dispute-a-medical-bill.astro": "Dispute a Medical Bill — Free | Seniors Audit",
  "src/pages/tools/medicare-advantage-vs-original-medicare-cost-checker.astro": "MA vs. Original Medicare Checker | Seniors Audit",
  "src/pages/tools/roth-conversion-calculator.astro": "Roth Conversion Calculator 2026 | Seniors Audit",
  "src/pages/tools/simple-will-estate-basics-explainer.astro": "Simple Will & Estate Basics | Seniors Audit",
  "src/pages/tools/smartphone-video-call-setup-guide.astro": "Video Call Setup Guide — Free | Seniors Audit",
};

const basePath = "c:/Users/JAMES PERFECT/OneDrive/Desktop/xyz-main";

// Apply explicit fixes
for (const [relPath, newTitle] of Object.entries(explicitFixes)) {
  const fullPath = path.join(basePath, relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/title=(['"])(.*?)\1/, `title="${newTitle}"`);
    fs.writeFileSync(fullPath, content);
    console.log(`Fixed explicit: ${relPath}`);
  } else {
    console.warn(`File not found: ${fullPath}`);
  }
}

// Function to shorten title
function shortenTitle(title, relPath) {
  // We need rendered title <= 60 chars
  // rendered title = title.includes('Seniors Audit') ? title : title + ' | Seniors Audit'
  let renderedLen = title.includes('Seniors Audit') ? title.length : title.length + 16;
  if (renderedLen <= 60) return title; // already good
  
  // Extract primary keyword (rough approximation: first few words or everything before a colon/dash)
  // But we must end with ' | Seniors Audit'. So we have 60 - 16 = 44 chars for the actual title part.
  let baseTitle = title.replace(/\s*[|—-]\s*Seniors Audit$/, ''); // remove suffix if exists
  if (baseTitle.length > 44) {
      baseTitle = baseTitle.substring(0, 41) + '...';
  }
  return baseTitle + ' | Seniors Audit';
}

const toolsDir = path.join(basePath, "src/pages/tools");
if (fs.existsSync(toolsDir)) {
    const files = fs.readdirSync(toolsDir).filter(f => f.endsWith('.astro'));
    for (const file of files) {
        const fullPath = path.join(toolsDir, file);
        let content = fs.readFileSync(fullPath, 'utf8');
        const match = content.match(/title=(['"])(.*?)\1/);
        if (match) {
            const oldTitle = match[2];
            let renderedLen = oldTitle.includes('Seniors Audit') ? oldTitle.length : oldTitle.length + 16;
            if (renderedLen > 60) {
                // Shorten it manually based on rules if it's one of the listed ones, or automatically
                const newTitle = shortenTitle(oldTitle, file);
                content = content.replace(/title=(['"])(.*?)\1/, `title="${newTitle}"`);
                fs.writeFileSync(fullPath, content);
                console.log(`Shortened ${file}: "${oldTitle}" -> "${newTitle}"`);
            }
        }
    }
}

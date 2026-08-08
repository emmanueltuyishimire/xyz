import fs from 'fs';
import path from 'path';

const contentDir = 'c:/Users/JAMES PERFECT/OneDrive/Desktop/xyz-main/src/content/medicare';
const toolsDir   = 'c:/Users/JAMES PERFECT/OneDrive/Desktop/xyz-main/src/pages/tools';

// 1. Audit and update Markdown articles
const mdFiles = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));
console.log(`Found ${mdFiles.length} Medicare markdown files.`);

let mdUpdatedCount = 0;

for (const file of mdFiles) {
  const filePath = path.join(contentDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if file already links to /medicare/ or /medicare
  const hasPillarLink = /\]\(\/medicare\/?\)/i.test(content) || /\]\(https:\/\/www\.seniorsaudit\.com\/medicare\/?\)/i.test(content);

  if (!hasPillarLink) {
    // Add in-body link near the intro and in Related Articles if applicable
    // 1) Add to intro / after Quick Answer / after intro paragraph
    const introParagraphRegex = /(Choosing between|Navigating|Signing up for|Understanding|Medicare is|If you|When you|As you|The Medicare|As of 2026|Each year)[^\n]+\n/i;
    
    // We can insert a sentence right after the lead paragraph
    const backlinkSentence = `\nFor a complete breakdown of all four parts, enrollment deadlines, and 2026 costs, see our master guide on [Medicare explained](/medicare/).\n`;
    
    // Insert after "What this article covers" or Quick Answer box
    if (content.includes('**What this article covers:**') || content.includes('## What This Article Covers')) {
      content = content.replace(/((\*\*What this article covers:\*\*|## What This Article Covers)[^\n]+\n)/i, `$1${backlinkSentence}`);
    } else {
      // Fallback: insert after Quick Answer div
      content = content.replace(/(<\/div>\s*\n\n)/i, `$1${backlinkSentence}`);
    }

    // 2) Add to "Related Articles" section at the end if present
    if (content.includes('Related Articles')) {
      const relatedLink = `- [Medicare Explained: Complete 2026 Guide](/medicare/) — Our master hub guide covering Parts A, B, C, and D, enrollment windows, and 2026 costs.\n`;
      content = content.replace(/((\*\*|## )Related Articles[^\n]*\n)/i, `$1${relatedLink}`);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    mdUpdatedCount++;
    console.log(`Updated ${file} with pillar back-link.`);
  } else {
    console.log(`${file} already contains pillar back-link.`);
  }
}

console.log(`Total MD files updated: ${mdUpdatedCount}`);

// 2. Audit and update Medicare tools in src/pages/tools/
const toolFiles = fs.readdirSync(toolsDir).filter(f => f.includes('medicare') || f.includes('irmaa') || f.includes('medigap'));
console.log(`Found ${toolFiles.length} Medicare tool files.`);

let toolUpdatedCount = 0;

for (const file of toolFiles) {
  const filePath = path.join(toolsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  const hasPillarLink = /href="\/medicare\/"/i.test(content) || /\]\(\/medicare\/?\)/i.test(content) || /href="https:\/\/www\.seniorsaudit\.com\/medicare\/"/i.test(content);

  if (!hasPillarLink) {
    // Add back-link to pillar page in tool UI or layout
    // Look for tool lead paragraph or related guides
    if (content.includes('relatedHubs') || content.includes('relatedArticles')) {
      content = content.replace(/relatedHubs\s*=\s*\[/, `relatedHubs = [\n  {\n    title: 'Medicare Explained: Master 2026 Guide',\n    description: 'Our comprehensive master guide covering Parts A, B, C, and D, enrollment deadlines, and costs.',\n    href: '/medicare/'\n  },`);
    } else if (content.includes('<p') && content.includes('Medicare')) {
      // Insert in text
      content = content.replace(/(<p[^>]*>[^<]*Medicare[^<]*<\/p>)/i, `$1\n<p>For a complete breakdown of all four parts, enrollment rules, and 2026 costs, explore our master guide on <a href="/medicare/">Medicare explained</a>.</p>`);
    }
    fs.writeFileSync(filePath, content, 'utf8');
    toolUpdatedCount++;
    console.log(`Updated tool ${file} with pillar back-link.`);
  } else {
    console.log(`Tool ${file} already has pillar back-link.`);
  }
}

console.log(`Total Tool files updated: ${toolUpdatedCount}`);

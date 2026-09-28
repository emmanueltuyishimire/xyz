import fs from 'fs';
import path from 'path';

const report = JSON.parse(fs.readFileSync('scripts/nav_audit_report.json', 'utf8'));

// Build destination map
const destMap = {};

function add(href, source, label) {
  if (!href) return;
  const norm = href.endsWith('/') ? href : href + '/';
  if (!destMap[norm]) {
    destMap[norm] = {
      href: norm,
      header: null,
      mobile: null,
      footer: null,
      toolsPage: null,
      h1: null,
    };
  }
  destMap[norm][source] = label;
}

// Add header links
for (const l of report.headerLinks) {
  add(l.href, 'header', l.label);
  if (l.h1) destMap[l.href.endsWith('/') ? l.href : l.href + '/'].h1 = l.h1;
}

// Add mobile links
for (const l of report.mobileLinks) {
  add(l.href, 'mobile', l.label);
}

// Add footer links
for (const l of report.footerLinks) {
  add(l.href, 'footer', l.label);
}

// Add toolsPage labels
for (const [href, label] of Object.entries(report.toolsLabels)) {
  add(href, 'toolsPage', label);
}

// Check destinations with multiple different labels
const mismatches = [];
for (const [href, data] of Object.entries(destMap)) {
  // If h1 is not populated yet, check dist
  if (!data.h1) {
    let p = path.join('dist', href.replace(/^\//, ''), 'index.html');
    if (href === '/') p = path.join('dist', 'index.html');
    if (fs.existsSync(p)) {
      const html = fs.readFileSync(p, 'utf8');
      const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      if (m) data.h1 = m[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
    }
  }

  const distinctLabels = new Set(
    [data.header, data.mobile, data.footer, data.toolsPage]
      .filter(Boolean)
      .map(l => l.replace(/\s*→\s*$/, '').trim())
  );

  if (distinctLabels.size > 1) {
    mismatches.push({
      href,
      labels: {
        header: data.header,
        mobile: data.mobile,
        footer: data.footer,
        toolsPage: data.toolsPage,
        h1: data.h1
      },
      distinctLabels: [...distinctLabels]
    });
  }
}

console.log('Total destinations with label mismatches:', mismatches.length);
fs.writeFileSync('scripts/label_mismatches.json', JSON.stringify(mismatches, null, 2));
console.log(JSON.stringify(mismatches, null, 2));

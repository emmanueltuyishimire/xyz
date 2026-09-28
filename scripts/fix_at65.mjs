import fs from 'fs';

let content = fs.readFileSync('src/pages/medicare/at-65.astro', 'utf8');
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Early Planning Horizon: Your Medicare Enrollment Opens in')) {
    // line i + 3 is the warning push
    console.log('Found line at index', i + 3, ':', lines[i + 3]);
    lines[i + 3] = lines[i + 3].replace(/icon:\s*['"][^'"]*['"]/, "icon: '⏳'");
  }
}
fs.writeFileSync('src/pages/medicare/at-65.astro', lines.join('\n'), 'utf8');
console.log('Updated at-65.astro');

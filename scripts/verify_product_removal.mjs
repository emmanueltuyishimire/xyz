import fs from 'fs';
import path from 'path';

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        walkDir(fullPath, fileList);
      }
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const targets = [...walkDir('src'), ...walkDir('public')];

function searchFiles(name, regex) {
  console.log(`\n=== CHECK: ${name} ===`);
  let matches = [];
  for (const file of targets) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (regex.test(line)) {
        matches.push(`${file}:${idx + 1}: ${line.trim()}`);
      }
    });
  }
  if (matches.length === 0) {
    console.log('0 matches found (CLEAN)');
  } else {
    console.log(`Found ${matches.length} matches:`);
    matches.forEach(m => console.log('  ' + m));
  }
}

searchFiles('gumroad (case-insensitive)', /gumroad/i);
searchFiles('resources.seniorsaudit.com', /resources\.seniorsaudit\.com/i);
searchFiles('/resources/ (internal links or paths)', /\/resources\//i);
searchFiles('JSON-LD Product or Offer', /"@type":\s*"(Product|Offer)"/i);
searchFiles('Decap CMS resources references', /resources/i);

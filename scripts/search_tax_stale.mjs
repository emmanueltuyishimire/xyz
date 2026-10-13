import fs from 'fs';
import path from 'path';

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') walkDir(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const targets = walkDir('src');
const values = [
  '103,350', '103350',
  '48,475', '48475',
  '11,925', '11925',
  '96,950', '96950',
  '206,700', '206700',
  '23,850', '23850',
  '197,300', '197300',
  '394,600', '394600',
  '2024-40', '2025-28'
];

for (const file of targets) {
  const content = fs.readFileSync(file, 'utf-8');
  for (const val of values) {
    if (content.includes(val)) {
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes(val)) {
          console.log(`${file}:${idx + 1}: found [${val}]: ${line.trim()}`);
        }
      });
    }
  }
}

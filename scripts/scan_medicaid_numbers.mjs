import fs from 'fs';
import path from 'path';

function walkDir(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
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

const targets = [...walkDir('src'), ...walkDir('public'), ...walkDir('data')];
const patterns = ['32,556', '32556', '32,532', '32532', '162,780', '162780', '162,660', '162660', '1,128,000', '1128000', '1,130,000', '1130000', '752,000', '752000'];

for (const file of targets) {
  const content = fs.readFileSync(file, 'utf-8');
  for (const p of patterns) {
    if (content.includes(p)) {
      const lines = content.split('\n');
      lines.forEach((l, idx) => {
        if (l.includes(p)) console.log(`${file}:${idx + 1}: [${p}] ${l.trim()}`);
      });
    }
  }
}

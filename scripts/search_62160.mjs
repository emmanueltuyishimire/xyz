import fs from 'fs';
import path from 'path';

const files = fs.readdirSync('src/pages/tools');
for (const file of files) {
  const content = fs.readFileSync(path.join('src/pages/tools', file), 'utf8');
  if (content.includes('62,160') || content.includes('62160')) {
    console.log(`Found 62,160 in: src/pages/tools/${file}`);
  }
}

const compFiles = fs.readdirSync('src/components/tools');
for (const file of compFiles) {
  const content = fs.readFileSync(path.join('src/components/tools', file), 'utf8');
  if (content.includes('62,160') || content.includes('62160')) {
    console.log(`Found 62,160 in: src/components/tools/${file}`);
  }
}

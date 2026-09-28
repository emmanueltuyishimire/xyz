import fs from 'fs';
import { execSync } from 'child_process';

const status = execSync('git status --porcelain').toString('utf8');
const files = status.split('\n')
  .map(l => l.substring(3).trim())
  .filter(f => f && fs.existsSync(f) && fs.statSync(f).isFile());

const corrupted = [];
for (const file of files) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('â€”') || content.includes('ðŸ') || content.includes('â™¿') || content.includes('â†’')) {
      corrupted.push(file);
    }
  } catch (e) {}
}

console.log('Total corrupted files found:', corrupted.length);
console.log(JSON.stringify(corrupted, null, 2));

import fs from 'fs';
import { execSync } from 'child_process';

const status = execSync('git status --porcelain').toString('utf8');
const files = status.split('\n')
  .map(l => l.substring(3).trim())
  .filter(f => f && fs.existsSync(f) && fs.statSync(f).isFile());

for (const file of files) {
  try {
    const diff = execSync(`git diff HEAD -- "${file}"`, { maxBuffer: 10 * 1024 * 1024 }).toString('utf8');
    const lines = diff.split('\n');
    let realChange = 0;
    for (const line of lines) {
      if ((line.startsWith('+') && !line.startsWith('+++')) || (line.startsWith('-') && !line.startsWith('---'))) {
        const text = line.substring(1).replace(/[^\x20-\x7E]/g, '').trim();
        // If the line only differs by non-ascii characters, text before and after will match
        // Let's see if there are actual words changed
      }
    }
  } catch (e) {}
}

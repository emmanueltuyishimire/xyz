import fs from 'fs';

const content = fs.readFileSync('src/content/medicaid/does-medicaid-cover-dental.md', 'utf8');
const lines = content.split('\n');
const line = lines[207]; // L208
console.log('Line 208 text:', line);
for (let i = 0; i < line.length; i++) {
  const code = line.charCodeAt(i);
  if (code > 127) {
    console.log(`char at ${i}: "${line[i]}" code: ${code} hex: 0x${code.toString(16)}`);
  }
}

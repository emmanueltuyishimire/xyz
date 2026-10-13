import fs from 'fs';
const tools = fs.readdirSync('src/pages/tools').filter(f => f.endsWith('.astro'));
for (const t of tools) {
  const content = fs.readFileSync('src/pages/tools/' + t, 'utf-8');
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.includes('components/tools')) {
      console.log(`${t}: ${line.trim()}`);
    }
  }
}

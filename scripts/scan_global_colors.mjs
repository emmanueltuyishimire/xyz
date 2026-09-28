import fs from 'fs';

const css = fs.readFileSync('src/styles/global.css', 'utf8');
const lines = css.split('\n');

lines.forEach((l, i) => {
  if (
    l.includes('0D2137') ||
    l.includes('0d2137') ||
    l.includes('green') ||
    l.includes('teal') ||
    l.includes('0A3D3A') ||
    l.includes('0a3d3a') ||
    l.includes('1DB8A8') ||
    l.includes('1db8a8') ||
    l.includes('success')
  ) {
    console.log(`L${i+1}: ${l.trim()}`);
  }
});

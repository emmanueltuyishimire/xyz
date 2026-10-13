import fs from 'fs';
import zlib from 'zlib';

const buf = fs.readFileSync('data/sources/rp-25-32.pdf');
let pos = 0;
let streamIndex = 0;
const pageTexts = [];

while (true) {
  const start = buf.indexOf(Buffer.from('stream\r\n'), pos);
  if (start === -1) break;
  const sStart = start + 8;
  const end = buf.indexOf(Buffer.from('\r\nendstream'), sStart);
  if (end === -1) break;
  const slice = buf.subarray(sStart, end);
  try {
    const unzipped = zlib.inflateSync(slice).toString('latin1');
    // Check if it looks like page content (contains BT ... ET)
    if (unzipped.includes('BT') && unzipped.includes('ET')) {
      // extract text in Tj or TJ
      const textMatches = [];
      const lines = unzipped.split('\n');
      for (const line of lines) {
        const tj = line.match(/\((.*?)\)\s*Tj/);
        if (tj) textMatches.push(tj[1]);
        const TJ = line.match(/\[(.*?)\]\s*TJ/);
        if (TJ) {
          const inner = TJ[1].match(/\((.*?)\)/g) || [];
          textMatches.push(inner.map(s => s.slice(1, -1)).join(''));
        }
      }
      if (textMatches.length > 0) {
        pageTexts.push({ streamIndex, text: textMatches.join(' ') });
      }
    }
  } catch (e) {}
  streamIndex++;
  pos = end + 11;
}

console.log('Total content streams found:', pageTexts.length);
pageTexts.forEach((p, idx) => {
  if (p.text.includes('SECTION 4') || p.text.includes('Tax Rate Tables') || p.text.includes('Standard Deduction') || p.text.includes('16,100')) {
    console.log(`\n=== PAGE / STREAM ${idx + 1} (Stream #${p.streamIndex}) ===`);
    console.log(p.text.slice(0, 800));
  }
});
